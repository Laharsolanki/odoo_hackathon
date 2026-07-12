/**
 * Trip Service — Core business logic for trip lifecycle.
 * 
 * This is the MOST CRITICAL file in the entire system.
 * Handles dispatch, complete, cancel with full state machine enforcement,
 * cargo validation, and vehicle/driver status management.
 * 
 * Owner: Member 3 (Integration Lead)
 */

import prisma from '../prisma';
import { TRIP_STATUSES, assertTransition, isActive } from '../stateMachines/tripStateMachine';
import { VEHICLE_STATUSES, assertVehicleDispatchable } from '../stateMachines/vehicleStateMachine';
import { DRIVER_STATUSES, assertDriverDispatchable } from '../stateMachines/driverStateMachine';

export interface CreateTripInput {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  plannedDistance: number;
  revenue?: number;
}

/**
 * Create a trip as Draft — does NOT dispatch.
 * Validates that vehicle and driver exist but does NOT lock them.
 */
export async function createTrip(data: CreateTripInput) {
  // Verify vehicle exists
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Vehicle not found' };
  }

  // Verify driver exists
  const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
  if (!driver) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Driver not found' };
  }

  const trip = await prisma.trip.create({
    data: {
      source: data.source,
      destination: data.destination,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      cargoWeight: data.cargoWeight,
      plannedDistance: data.plannedDistance,
      revenue: data.revenue || 0,
      status: TRIP_STATUSES.DRAFT,
    },
    include: { vehicle: true, driver: true },
  });

  return trip;
}

/**
 * DISPATCH a trip.
 * 
 * This is the most validation-heavy operation in the system.
 * 
 * Guards:
 * 1. Trip must be in Draft status
 * 2. Vehicle must be Available (not Retired, In Shop, or On Trip)
 * 3. Driver must be Available (not Suspended, On Trip, Off Duty)
 * 4. Driver license must not be expired
 * 5. Cargo weight must not exceed vehicle max load capacity
 * 
 * Side effects:
 * - Trip status → Dispatched
 * - Vehicle status → On Trip
 * - Driver status → On Trip
 */
export async function dispatchTrip(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { vehicle: true, driver: true },
  });

  if (!trip) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Trip not found' };
  }

  // 1. Validate trip state transition
  assertTransition(trip.status, TRIP_STATUSES.DISPATCHED);

  // 2. Validate vehicle availability
  assertVehicleDispatchable(trip.vehicle);

  // 3. Validate driver availability + license expiry
  assertDriverDispatchable(trip.driver);

  // 4. Validate cargo capacity
  if (trip.cargoWeight > trip.vehicle.maxLoadCapacity) {
    throw {
      status: 400,
      code: 'CARGO_OVERWEIGHT',
      message: `Cargo weight (${trip.cargoWeight}kg) exceeds vehicle capacity (${trip.vehicle.maxLoadCapacity}kg)`,
      details: { cargoWeight: trip.cargoWeight, maxCapacity: trip.vehicle.maxLoadCapacity },
    };
  }

  // 5. Execute state transitions — use Prisma transaction for atomicity
  const [updatedTrip] = await prisma.$transaction([
    prisma.trip.update({
      where: { id: tripId },
      data: { status: TRIP_STATUSES.DISPATCHED },
      include: { vehicle: true, driver: true },
    }),
    prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: VEHICLE_STATUSES.ON_TRIP },
    }),
    prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: DRIVER_STATUSES.ON_TRIP },
    }),
  ]);

  return updatedTrip;
}

/**
 * COMPLETE a trip.
 * 
 * Side effects:
 * - Trip status → Completed
 * - Vehicle status → Available
 * - Driver status → Available
 */
export async function completeTrip(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { vehicle: true, driver: true },
  });

  if (!trip) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Trip not found' };
  }

  // Validate transition (only from Dispatched)
  assertTransition(trip.status, TRIP_STATUSES.COMPLETED);

  const wasActive = isActive(trip.status);

  const updates: any[] = [
    prisma.trip.update({
      where: { id: tripId },
      data: { status: TRIP_STATUSES.COMPLETED },
      include: { vehicle: true, driver: true },
    }),
  ];

  // Restore vehicle and driver if trip was actively dispatched
  if (wasActive) {
    if (trip.vehicle.status === VEHICLE_STATUSES.ON_TRIP) {
      updates.push(
        prisma.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VEHICLE_STATUSES.AVAILABLE },
        })
      );
    }

    if (trip.driver.status === DRIVER_STATUSES.ON_TRIP) {
      updates.push(
        prisma.driver.update({
          where: { id: trip.driverId },
          data: { status: DRIVER_STATUSES.AVAILABLE },
        })
      );
    }
  }

  const [updatedTrip] = await prisma.$transaction(updates);

  return updatedTrip;
}

/**
 * CANCEL a trip.
 * 
 * If the trip was dispatched (vehicle/driver are On Trip),
 * restores both to Available.
 * If the trip was only Draft, no resource restoration needed.
 */
export async function cancelTrip(tripId: string, cancelReason?: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { vehicle: true, driver: true },
  });

  if (!trip) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Trip not found' };
  }

  assertTransition(trip.status, TRIP_STATUSES.CANCELLED);

  const wasActive = isActive(trip.status);

  const updates: any[] = [
    prisma.trip.update({
      where: { id: tripId },
      data: { status: TRIP_STATUSES.CANCELLED },
      include: { vehicle: true, driver: true },
    }),
  ];

  // Only restore resources if trip was actively dispatched
  if (wasActive) {
    if (trip.vehicle.status === VEHICLE_STATUSES.ON_TRIP) {
      updates.push(
        prisma.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VEHICLE_STATUSES.AVAILABLE },
        })
      );
    }

    if (trip.driver.status === DRIVER_STATUSES.ON_TRIP) {
      updates.push(
        prisma.driver.update({
          where: { id: trip.driverId },
          data: { status: DRIVER_STATUSES.AVAILABLE },
        })
      );
    }
  }

  const [updatedTrip] = await prisma.$transaction(updates);

  return updatedTrip;
}

/**
 * Get available vehicles for dispatch selection.
 * Excludes Retired and In Shop vehicles.
 */
export async function getAvailableVehicles() {
  return prisma.vehicle.findMany({
    where: { status: VEHICLE_STATUSES.AVAILABLE },
  });
}

/**
 * Get available drivers for dispatch selection.
 * Excludes Suspended, On Trip, Off Duty, and expired license drivers.
 */
export async function getAvailableDrivers() {
  return prisma.driver.findMany({
    where: {
      status: DRIVER_STATUSES.AVAILABLE,
      licenseExpiryDate: { gt: new Date() },
    },
  });
}
