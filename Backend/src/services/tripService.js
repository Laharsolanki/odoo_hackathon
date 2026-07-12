"use strict";
/**
 * Trip Service — Core business logic for trip lifecycle.
 *
 * This is the MOST CRITICAL file in the entire system.
 * Handles dispatch, complete, cancel with full state machine enforcement,
 * cargo validation, and vehicle/driver status management.
 *
 * Owner: Member 3 (Integration Lead)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrip = createTrip;
exports.dispatchTrip = dispatchTrip;
exports.completeTrip = completeTrip;
exports.cancelTrip = cancelTrip;
exports.getAvailableVehicles = getAvailableVehicles;
exports.getAvailableDrivers = getAvailableDrivers;
const prisma_1 = __importDefault(require("../prisma"));
const tripStateMachine_1 = require("../stateMachines/tripStateMachine");
const vehicleStateMachine_1 = require("../stateMachines/vehicleStateMachine");
const driverStateMachine_1 = require("../stateMachines/driverStateMachine");
/**
 * Create a trip as Draft — does NOT dispatch.
 * Validates that vehicle and driver exist but does NOT lock them.
 */
async function createTrip(data) {
    // Verify vehicle exists
    const vehicle = await prisma_1.default.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Vehicle not found' };
    }
    // Verify driver exists
    const driver = await prisma_1.default.driver.findUnique({ where: { id: data.driverId } });
    if (!driver) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Driver not found' };
    }
    const trip = await prisma_1.default.trip.create({
        data: {
            source: data.source,
            destination: data.destination,
            vehicleId: data.vehicleId,
            driverId: data.driverId,
            cargoWeight: data.cargoWeight,
            plannedDistance: data.plannedDistance,
            revenue: data.revenue || 0,
            status: tripStateMachine_1.TRIP_STATUSES.DRAFT,
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
async function dispatchTrip(tripId) {
    const trip = await prisma_1.default.trip.findUnique({
        where: { id: tripId },
        include: { vehicle: true, driver: true },
    });
    if (!trip) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Trip not found' };
    }
    // 1. Validate trip state transition
    (0, tripStateMachine_1.assertTransition)(trip.status, tripStateMachine_1.TRIP_STATUSES.DISPATCHED);
    // 2. Validate vehicle availability
    (0, vehicleStateMachine_1.assertVehicleDispatchable)(trip.vehicle);
    // 3. Validate driver availability + license expiry
    (0, driverStateMachine_1.assertDriverDispatchable)(trip.driver);
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
    const [updatedTrip] = await prisma_1.default.$transaction([
        prisma_1.default.trip.update({
            where: { id: tripId },
            data: { status: tripStateMachine_1.TRIP_STATUSES.DISPATCHED },
            include: { vehicle: true, driver: true },
        }),
        prisma_1.default.vehicle.update({
            where: { id: trip.vehicleId },
            data: { status: vehicleStateMachine_1.VEHICLE_STATUSES.ON_TRIP },
        }),
        prisma_1.default.driver.update({
            where: { id: trip.driverId },
            data: { status: driverStateMachine_1.DRIVER_STATUSES.ON_TRIP },
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
async function completeTrip(tripId) {
    const trip = await prisma_1.default.trip.findUnique({
        where: { id: tripId },
        include: { vehicle: true, driver: true },
    });
    if (!trip) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Trip not found' };
    }
    // Validate transition (only from Dispatched)
    (0, tripStateMachine_1.assertTransition)(trip.status, tripStateMachine_1.TRIP_STATUSES.COMPLETED);
    const wasActive = (0, tripStateMachine_1.isActive)(trip.status);
    const updates = [
        prisma_1.default.trip.update({
            where: { id: tripId },
            data: { status: tripStateMachine_1.TRIP_STATUSES.COMPLETED },
            include: { vehicle: true, driver: true },
        }),
    ];
    // Restore vehicle and driver if trip was actively dispatched
    if (wasActive) {
        if (trip.vehicle.status === vehicleStateMachine_1.VEHICLE_STATUSES.ON_TRIP) {
            updates.push(prisma_1.default.vehicle.update({
                where: { id: trip.vehicleId },
                data: { status: vehicleStateMachine_1.VEHICLE_STATUSES.AVAILABLE },
            }));
        }
        if (trip.driver.status === driverStateMachine_1.DRIVER_STATUSES.ON_TRIP) {
            updates.push(prisma_1.default.driver.update({
                where: { id: trip.driverId },
                data: { status: driverStateMachine_1.DRIVER_STATUSES.AVAILABLE },
            }));
        }
    }
    const [updatedTrip] = await prisma_1.default.$transaction(updates);
    return updatedTrip;
}
/**
 * CANCEL a trip.
 *
 * If the trip was dispatched (vehicle/driver are On Trip),
 * restores both to Available.
 * If the trip was only Draft, no resource restoration needed.
 */
async function cancelTrip(tripId, cancelReason) {
    const trip = await prisma_1.default.trip.findUnique({
        where: { id: tripId },
        include: { vehicle: true, driver: true },
    });
    if (!trip) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Trip not found' };
    }
    (0, tripStateMachine_1.assertTransition)(trip.status, tripStateMachine_1.TRIP_STATUSES.CANCELLED);
    const wasActive = (0, tripStateMachine_1.isActive)(trip.status);
    const updates = [
        prisma_1.default.trip.update({
            where: { id: tripId },
            data: { status: tripStateMachine_1.TRIP_STATUSES.CANCELLED },
            include: { vehicle: true, driver: true },
        }),
    ];
    // Only restore resources if trip was actively dispatched
    if (wasActive) {
        if (trip.vehicle.status === vehicleStateMachine_1.VEHICLE_STATUSES.ON_TRIP) {
            updates.push(prisma_1.default.vehicle.update({
                where: { id: trip.vehicleId },
                data: { status: vehicleStateMachine_1.VEHICLE_STATUSES.AVAILABLE },
            }));
        }
        if (trip.driver.status === driverStateMachine_1.DRIVER_STATUSES.ON_TRIP) {
            updates.push(prisma_1.default.driver.update({
                where: { id: trip.driverId },
                data: { status: driverStateMachine_1.DRIVER_STATUSES.AVAILABLE },
            }));
        }
    }
    const [updatedTrip] = await prisma_1.default.$transaction(updates);
    return updatedTrip;
}
/**
 * Get available vehicles for dispatch selection.
 * Excludes Retired and In Shop vehicles.
 */
async function getAvailableVehicles() {
    return prisma_1.default.vehicle.findMany({
        where: { status: vehicleStateMachine_1.VEHICLE_STATUSES.AVAILABLE },
    });
}
/**
 * Get available drivers for dispatch selection.
 * Excludes Suspended, On Trip, Off Duty, and expired license drivers.
 */
async function getAvailableDrivers() {
    return prisma_1.default.driver.findMany({
        where: {
            status: driverStateMachine_1.DRIVER_STATUSES.AVAILABLE,
            licenseExpiryDate: { gt: new Date() },
        },
    });
}
//# sourceMappingURL=tripService.js.map