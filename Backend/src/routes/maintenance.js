"use strict";
/**
 * Maintenance Routes — Enhanced with vehicle state machine integration.
 *
 * Before (Member 2): Bare CRUD, no vehicle status management.
 * After  (Member 3): open → vehicle In Shop, close → vehicle Available.
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
const maintenanceService_1 = require("../services/maintenanceService");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.use((0, auth_1.requireRole)(['Fleet Manager', 'Safety Officer']));
// Get all maintenance logs
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, vehicleId } = req.query;
    const where = {};
    if (status)
        where.status = status;
    if (vehicleId)
        where.vehicleId = vehicleId;
    const logs = await prisma_1.default.maintenanceLog.findMany({
        where,
        include: { vehicle: true },
        orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
}));
// Get single maintenance record
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const log = await prisma_1.default.maintenanceLog.findUnique({
        where: { id: req.params.id },
        include: { vehicle: true },
    });
    if (!log) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Maintenance record not found' };
    }
    res.json(log);
}));
// ⭐ OPEN maintenance — sets vehicle to In Shop
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { vehicleId, description, startDate, cost } = req.body;
    // Input validation
    if (!vehicleId) {
        throw { status: 400, code: 'VALIDATION_ERROR', message: 'vehicleId is required' };
    }
    if (!description || !description.trim()) {
        throw { status: 400, code: 'VALIDATION_ERROR', message: 'description is required' };
    }
    if (!startDate) {
        throw { status: 400, code: 'VALIDATION_ERROR', message: 'startDate is required' };
    }
    const log = await (0, maintenanceService_1.openMaintenance)({ vehicleId, description, startDate, cost });
    res.status(201).json({ success: true, message: 'Maintenance opened, vehicle set to In Shop', data: log });
}));
// ⭐ CLOSE maintenance — restores vehicle to Available (unless Retired)
router.put('/:id/close', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { cost } = req.body;
    const log = await (0, maintenanceService_1.closeMaintenance)(req.params.id, cost);
    res.json({ success: true, message: 'Maintenance closed, vehicle status restored', data: log });
}));
// Update a maintenance log (generic fields only — status changes go through /close)
router.put('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const data = { ...req.body };
    // Prevent direct status changes — must use /close endpoint
    if (data.status === 'Closed') {
        throw {
            status: 400,
            code: 'USE_CLOSE_ENDPOINT',
            message: 'To close maintenance, use PUT /maintenance/:id/close instead',
        };
    }
    if (data.startDate)
        data.startDate = new Date(data.startDate);
    if (data.endDate)
        data.endDate = new Date(data.endDate);
    const log = await prisma_1.default.maintenanceLog.update({
        where: { id: req.params.id },
        data,
        include: { vehicle: true },
    });
    res.json(log);
}));
// Delete a maintenance log — only allowed for Open records
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const log = await prisma_1.default.maintenanceLog.findUnique({ where: { id: req.params.id } });
    if (!log) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Maintenance record not found' };
    }
    if (log.status === 'Closed') {
        throw { status: 409, code: 'CANNOT_DELETE', message: 'Closed maintenance records cannot be deleted' };
    }
    await prisma_1.default.maintenanceLog.delete({ where: { id: req.params.id } });
    res.status(204).send();
}));
exports.default = router;
//# sourceMappingURL=maintenance.js.map