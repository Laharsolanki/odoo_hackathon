"use strict";
/**
 * Vehicle Routes — Enhanced with unique registration validation,
 * retirement state machine, and delete guards.
 *
 * Owner: Member 3 (Integration Lead)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const vehicleService_1 = require("../services/vehicleService");
const vehicleStateMachine_1 = require("../stateMachines/vehicleStateMachine");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.use((0, auth_1.requireRole)(['Fleet Manager']));
// Get all vehicles with optional filtering
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, type, search } = req.query;
    const where = {};
    if (status)
        where.status = status;
    if (type)
        where.type = type;
    if (search) {
        where.OR = [
            { registrationNumber: { contains: search } },
            { modelName: { contains: search } },
        ];
    }
    const vehicles = await prisma_1.default.vehicle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
    res.json(vehicles);
}));
// ⭐ Get available vehicles (for dispatch dropdown)
router.get('/available', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const vehicles = await prisma_1.default.vehicle.findMany({
        where: { status: vehicleStateMachine_1.VEHICLE_STATUSES.AVAILABLE },
    });
    res.json(vehicles);
}));
// Get a single vehicle
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const vehicle = await prisma_1.default.vehicle.findUnique({
        where: { id: req.params.id },
    });
    if (!vehicle) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Vehicle not found' };
    }
    res.json(vehicle);
}));
// ⭐ Create — with unique registration validation
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { registrationNumber, modelName, type, maxLoadCapacity, odometer, acquisitionCost, status } = req.body;
    // Input validation
    if (!registrationNumber || !registrationNumber.trim()) {
        throw { status: 400, code: 'VALIDATION_ERROR', message: 'registrationNumber is required' };
    }
    if (!modelName || !modelName.trim()) {
        throw { status: 400, code: 'VALIDATION_ERROR', message: 'modelName is required' };
    }
    if (!maxLoadCapacity || maxLoadCapacity <= 0) {
        throw { status: 400, code: 'VALIDATION_ERROR', message: 'maxLoadCapacity must be a positive number' };
    }
    // ⭐ Business rule: unique registration number
    await (0, vehicleService_1.assertUniqueRegistration)(registrationNumber);
    const vehicle = await prisma_1.default.vehicle.create({
        data: {
            registrationNumber,
            modelName,
            type: type || 'truck',
            maxLoadCapacity,
            odometer: odometer || 0,
            acquisitionCost: acquisitionCost || 0,
            status: status || vehicleStateMachine_1.VEHICLE_STATUSES.AVAILABLE,
        },
    });
    res.status(201).json(vehicle);
}));
// ⭐ Update — with unique registration validation
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = { ...req.body };
    // Don't allow status changes through regular update — use specific endpoints
    delete data.status;
    // If registration number is changing, validate uniqueness
    if (data.registrationNumber) {
        await (0, vehicleService_1.assertUniqueRegistration)(data.registrationNumber, req.params.id);
    }
    const vehicle = await prisma_1.default.vehicle.update({
        where: { id: req.params.id },
        data,
    });
    res.json(vehicle);
}));
// ⭐ RETIRE a vehicle — terminal state transition
router.put('/:id/retire', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const vehicle = await (0, vehicleService_1.retireVehicle)(req.params.id);
    res.json({ success: true, message: 'Vehicle retired successfully', data: vehicle });
}));
// ⭐ Delete — with guard against deleting On Trip vehicles
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    await (0, vehicleService_1.assertCanDeleteVehicle)(req.params.id);
    await prisma_1.default.vehicle.delete({ where: { id: req.params.id } });
    res.status(204).send();
}));
exports.default = router;
//# sourceMappingURL=vehicles.js.map