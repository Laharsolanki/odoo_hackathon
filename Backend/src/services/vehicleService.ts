/**
 * Vehicle Service — Business logic for vehicle operations.
 * 
 * Handles unique registration validation, retirement, and availability.
 * 
 * Owner: Member 3 (Integration Lead)
 */

import prisma from '../prisma';
import { VEHICLE_STATUSES, assertTransition } from '../stateMachines/vehicleStateMachine';

/**
 * Validate unique registration number before create/update.
 */
export async function assertUniqueRegistration(regNumber: string, excludeId?: string) {
  const existing = await prisma.vehicle.findUnique({
    where: { registrationNumber: regNumber },
  });

  if (existing && existing.id !== excludeId) {
    throw {
      status: 409,
      code: 'VEH_REG_DUPLICATE',
      message: 'Registration number already exists',
      details: { registrationNumber: regNumber },
    };
  }
}

/**
 * Retire a vehicle — terminal state transition.
 */
export async function retireVehicle(vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Vehicle not found' };
  }

  assertTransition(vehicle.status, VEHICLE_STATUSES.RETIRED);

  return prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status: VEHICLE_STATUSES.RETIRED },
  });
}

/**
 * Guard: prevent deleting a vehicle that is currently on a trip.
 */
export async function assertCanDeleteVehicle(vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Vehicle not found' };
  }

  if (vehicle.status === VEHICLE_STATUSES.ON_TRIP) {
    throw {
      status: 409,
      code: 'VEH_ON_TRIP',
      message: 'Cannot delete a vehicle that is currently on a trip',
      details: { vehicleId },
    };
  }
}
