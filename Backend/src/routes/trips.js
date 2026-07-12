"use strict";
/**
 * Trip Routes — Enhanced with full business logic integration.
 *
 * Before (Member 2): Bare CRUD with no validation.
 * After  (Member 3): Full state machine enforcement, dispatch guards,
 *                     cargo validation, resource management.
 *
 * Owner: Member 3 (Integration Lead) — rewired from Member 2's scaffold
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const tripService_1 = require("../services/tripService");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.use((0, auth_1.requireRole)(['Fleet Manager']));
// Get all trips with optional filtering
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status, vehicleId, driverId } = req.query;
    const where = {};
    if (status)
        where.status = status;
    if (vehicleId)
        where.vehicleId = vehicleId;
    if (driverId)
        where.driverId = driverId;
    const trips = await prisma_1.default.trip.findMany({
        where,
        include: { vehicle: true, driver: true },
        orderBy: { createdAt: 'desc' },
    });
    res.json(trips);
}));
// Get single trip
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const trip = await prisma_1.default.trip.findUnique({
        where: { id: req.params.id },
        include: { vehicle: true, driver: true },
    });
    if (!trip) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Trip not found' };
    }
    res.json(trip);
}));
// Get available vehicles for dispatch selection
router.get('/available/vehicles', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const vehicles = await (0, tripService_1.getAvailableVehicles)();
    res.json(vehicles);
}));
// Get available drivers for dispatch selection
router.get('/available/drivers', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const drivers = await (0, tripService_1.getAvailableDrivers)();
    res.json(drivers);
}));
// Create a new trip (status: Draft)
// ⭐ Enhanced: validates vehicle and driver existence
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue } = req.body;
    // Input validation
    if (!source || !destination) {
        throw { status: 400, code: 'VALIDATION_ERROR', message: 'Source and destination are required' };
    }
    if (!vehicleId || !driverId) {
        throw { status: 400, code: 'VALIDATION_ERROR', message: 'vehicleId and driverId are required' };
    }
    if (cargoWeight === undefined || cargoWeight < 0) {
        throw { status: 400, code: 'VALIDATION_ERROR', message: 'cargoWeight must be a non-negative number' };
    }
    if (!plannedDistance || plannedDistance <= 0) {
        throw { status: 400, code: 'VALIDATION_ERROR', message: 'plannedDistance must be a positive number' };
    }
    const trip = await (0, tripService_1.createTrip)({
        source,
        destination,
        vehicleId,
        driverId,
        cargoWeight,
        plannedDistance,
        revenue,
    });
    res.status(201).json(trip);
}));
// ⭐ DISPATCH a trip — the most critical endpoint
// Enforces: trip state, vehicle availability, driver availability,
//           license expiry, cargo capacity
router.put('/:id/dispatch', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const trip = await (0, tripService_1.dispatchTrip)(req.params.id);
    res.json({ success: true, message: 'Trip dispatched successfully', data: trip });
}));
// ⭐ COMPLETE a trip
// Restores vehicle and driver to Available
router.put('/:id/complete', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const trip = await (0, tripService_1.completeTrip)(req.params.id);
    res.json({ success: true, message: 'Trip completed successfully', data: trip });
}));
// ⭐ CANCEL a trip
// Restores resources if trip was dispatched
router.put('/:id/cancel', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { reason } = req.body;
    const trip = await (0, tripService_1.cancelTrip)(req.params.id, reason);
    res.json({ success: true, message: 'Trip cancelled successfully', data: trip });
}));
// Legacy status update — REPLACED by specific endpoints above
// Kept for backward compatibility but validates via state machine
router.put('/:id/status', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    if (status === 'Dispatched') {
        const trip = await (0, tripService_1.dispatchTrip)(req.params.id);
        return res.json(trip);
    }
    if (status === 'Completed') {
        const trip = await (0, tripService_1.completeTrip)(req.params.id);
        return res.json(trip);
    }
    if (status === 'Cancelled') {
        const trip = await (0, tripService_1.cancelTrip)(req.params.id);
        return res.json(trip);
    }
    throw { status: 400, code: 'VALIDATION_ERROR', message: `Invalid status: ${status}` };
}));
// Delete a trip — only allowed for Draft trips
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const trip = await prisma_1.default.trip.findUnique({ where: { id: req.params.id } });
    if (!trip) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Trip not found' };
    }
    if (trip.status !== 'Draft') {
        throw {
            status: 409,
            code: 'CANNOT_DELETE',
            message: 'Only draft trips can be deleted. Cancel the trip instead.',
            details: { currentStatus: trip.status },
        };
    }
    await prisma_1.default.trip.delete({ where: { id: req.params.id } });
    res.status(204).send();
}));
exports.default = router;
//# sourceMappingURL=trips.js.map