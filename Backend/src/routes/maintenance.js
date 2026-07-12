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
router.use((0, auth_1.requireRole)(['Fleet Manager', 'Safety Officer']));
// Get all maintenance logs
router.get('/', async (req, res) => {
    try {
        const logs = await prisma_1.default.maintenanceLog.findMany();
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch maintenance logs' });
    }
});
// Create a maintenance log
router.post('/', async (req, res) => {
    try {
        const { vehicleId, description, startDate, endDate, status, cost } = req.body;
        const log = await prisma_1.default.maintenanceLog.create({
            data: {
                vehicleId,
                description,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                status,
                cost: cost || 0
            }
        });
        res.status(201).json(log);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create maintenance log' });
    }
});
// Update a maintenance log
router.put('/:id', async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.startDate)
            data.startDate = new Date(data.startDate);
        if (data.endDate)
            data.endDate = new Date(data.endDate);
        const log = await prisma_1.default.maintenanceLog.update({
            where: { id: req.params.id },
            data
        });
        res.json(log);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update maintenance log' });
    }
});
// Delete a maintenance log
router.delete('/:id', async (req, res) => {
    try {
        await prisma_1.default.maintenanceLog.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete maintenance log' });
    }
});
exports.default = router;
//# sourceMappingURL=maintenance.js.map