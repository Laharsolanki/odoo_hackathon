"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.use((0, auth_1.requireRole)(['Fleet Manager']));
// Get all trips
router.get('/', async (req, res) => {
    try {
        const trips = await prisma_1.default.trip.findMany();
        res.json(trips);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch trips' });
    }
});
// Create a new trip
router.post('/', async (req, res) => {
    try {
        const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, status, revenue } = req.body;
        const trip = await prisma_1.default.trip.create({
            data: { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, status, revenue: revenue || 0 }
        });
        res.status(201).json(trip);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create trip' });
    }
});
// Update a trip (e.g., status updates)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const trip = await prisma_1.default.trip.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(trip);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update trip status' });
    }
});
// Delete a trip
router.delete('/:id', async (req, res) => {
    try {
        await prisma_1.default.trip.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete trip' });
    }
});
exports.default = router;
//# sourceMappingURL=trips.js.map