"use strict";
/**
 * Maintenance Service — Business logic for maintenance lifecycle.
 *
 * Open maintenance → Vehicle goes to In Shop
 * Close maintenance → Vehicle restored to Available (unless Retired)
 *
 * Owner: Member 3 (Integration Lead)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openMaintenance = openMaintenance;
exports.closeMaintenance = closeMaintenance;
const prisma_1 = __importDefault(require("../prisma"));
const vehicleStateMachine_1 = require("../stateMachines/vehicleStateMachine");
/**
 * OPEN a maintenance record.
 *
 * Guards:
 * 1. Vehicle must exist
 * 2. Vehicle must not be Retired
 * 3. Vehicle must not already be In Shop
 * 4. Vehicle must not be On Trip
 *
 * Side effects:
 * - Vehicle status → In Shop
 * - Maintenance record created with status Open
 */
async function openMaintenance(data) {
    const vehicle = await prisma_1.default.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Vehicle not found' };
    }
    // Validate vehicle can enter maintenance
    (0, vehicleStateMachine_1.assertCanEnterMaintenance)(vehicle);
    // Use transaction for atomicity
    const [maintenance] = await prisma_1.default.$transaction([
        prisma_1.default.maintenanceLog.create({
            data: {
                vehicleId: data.vehicleId,
                description: data.description,
                startDate: new Date(data.startDate),
                status: 'Open',
                cost: data.cost || 0,
            },
            include: { vehicle: true },
        }),
        prisma_1.default.vehicle.update({
            where: { id: data.vehicleId },
            data: { status: vehicleStateMachine_1.VEHICLE_STATUSES.IN_SHOP },
        }),
    ]);
    return maintenance;
}
/**
 * CLOSE a maintenance record.
 *
 * Guards:
 * 1. Maintenance record must exist
 * 2. Maintenance must not already be Closed
 *
 * Side effects:
 * - Maintenance status → Closed, endDate set
 * - Vehicle status → Available (unless Retired)
 */
async function closeMaintenance(maintenanceId, cost) {
    const maintenance = await prisma_1.default.maintenanceLog.findUnique({
        where: { id: maintenanceId },
        include: { vehicle: true },
    });
    if (!maintenance) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Maintenance record not found' };
    }
    if (maintenance.status === 'Closed') {
        throw {
            status: 409,
            code: 'MAINT_ALREADY_CLOSED',
            message: 'Maintenance record is already closed',
            details: { maintenanceId },
        };
    }
    const newVehicleStatus = (0, vehicleStateMachine_1.statusAfterMaintenanceClose)(maintenance.vehicle);
    const [updatedMaintenance] = await prisma_1.default.$transaction([
        prisma_1.default.maintenanceLog.update({
            where: { id: maintenanceId },
            data: {
                status: 'Closed',
                endDate: new Date(),
                cost: cost !== undefined ? cost : maintenance.cost,
            },
            include: { vehicle: true },
        }),
        prisma_1.default.vehicle.update({
            where: { id: maintenance.vehicleId },
            data: { status: newVehicleStatus },
        }),
    ]);
    return updatedMaintenance;
}
//# sourceMappingURL=maintenanceService.js.map