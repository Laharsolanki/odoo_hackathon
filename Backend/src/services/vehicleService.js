"use strict";
/**
 * Vehicle Service — Business logic for vehicle operations.
 *
 * Handles unique registration validation, retirement, and availability.
 *
 * Owner: Member 3 (Integration Lead)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertUniqueRegistration = assertUniqueRegistration;
exports.retireVehicle = retireVehicle;
exports.assertCanDeleteVehicle = assertCanDeleteVehicle;
const prisma_1 = __importDefault(require("../prisma"));
const vehicleStateMachine_1 = require("../stateMachines/vehicleStateMachine");
/**
 * Validate unique registration number before create/update.
 */
async function assertUniqueRegistration(regNumber, excludeId) {
    const existing = await prisma_1.default.vehicle.findUnique({
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
async function retireVehicle(vehicleId) {
    const vehicle = await prisma_1.default.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Vehicle not found' };
    }
    (0, vehicleStateMachine_1.assertTransition)(vehicle.status, vehicleStateMachine_1.VEHICLE_STATUSES.RETIRED);
    return prisma_1.default.vehicle.update({
        where: { id: vehicleId },
        data: { status: vehicleStateMachine_1.VEHICLE_STATUSES.RETIRED },
    });
}
/**
 * Guard: prevent deleting a vehicle that is currently on a trip.
 */
async function assertCanDeleteVehicle(vehicleId) {
    const vehicle = await prisma_1.default.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Vehicle not found' };
    }
    if (vehicle.status === vehicleStateMachine_1.VEHICLE_STATUSES.ON_TRIP) {
        throw {
            status: 409,
            code: 'VEH_ON_TRIP',
            message: 'Cannot delete a vehicle that is currently on a trip',
            details: { vehicleId },
        };
    }
}
//# sourceMappingURL=vehicleService.js.map