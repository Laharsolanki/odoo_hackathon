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
router.use((0, auth_1.requireRole)(['Fleet Manager', 'Financial Analyst']));
// Total Operational Cost (Maintenance + Expenses) for a vehicle
router.get('/vehicle/:id/cost', async (req, res) => {
    try {
        const vehicleId = req.params.id;
        const maintenanceAgg = await prisma_1.default.maintenanceLog.aggregate({
            _sum: { cost: true },
            where: { vehicleId }
        });
        const expenseAgg = await prisma_1.default.expenseLog.aggregate({
            _sum: { cost: true },
            where: { vehicleId }
        });
        const totalMaintenance = maintenanceAgg._sum.cost || 0;
        const totalExpenses = expenseAgg._sum.cost || 0;
        const totalCost = totalMaintenance + totalExpenses;
        res.json({ vehicleId, totalMaintenance, totalExpenses, totalOperationalCost: totalCost });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to calculate cost' });
    }
});
// Fuel Efficiency (Distance / Fuel Consumed)
router.get('/vehicle/:id/efficiency', async (req, res) => {
    try {
        const vehicleId = req.params.id;
        const tripsAgg = await prisma_1.default.trip.aggregate({
            _sum: { plannedDistance: true },
            where: { vehicleId, status: 'Completed' }
        });
        const fuelAgg = await prisma_1.default.expenseLog.aggregate({
            _sum: { metricUnits: true },
            where: { vehicleId, type: 'Fuel' }
        });
        const totalDistance = tripsAgg._sum.plannedDistance || 0;
        const totalFuel = fuelAgg._sum.metricUnits || 0;
        const efficiency = totalFuel > 0 ? (totalDistance / totalFuel) : 0;
        res.json({ vehicleId, totalDistance, totalFuel, fuelEfficiency: efficiency });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to calculate efficiency' });
    }
});
// Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
router.get('/vehicle/:id/roi', async (req, res) => {
    try {
        const vehicleId = req.params.id;
        const vehicle = await prisma_1.default.vehicle.findUnique({
            where: { id: vehicleId }
        });
        if (!vehicle)
            return res.status(404).json({ error: 'Vehicle not found' });
        const tripsAgg = await prisma_1.default.trip.aggregate({
            _sum: { revenue: true },
            where: { vehicleId, status: 'Completed' } // Only completed trips contribute to realized revenue
        });
        const maintenanceAgg = await prisma_1.default.maintenanceLog.aggregate({
            _sum: { cost: true },
            where: { vehicleId }
        });
        const expenseAgg = await prisma_1.default.expenseLog.aggregate({
            _sum: { cost: true },
            where: { vehicleId }
        });
        const totalRevenue = tripsAgg._sum.revenue || 0;
        const totalMaintenance = maintenanceAgg._sum.cost || 0;
        const totalExpenses = expenseAgg._sum.cost || 0;
        const acquisitionCost = vehicle.acquisitionCost;
        const roi = acquisitionCost > 0
            ? (totalRevenue - (totalMaintenance + totalExpenses)) / acquisitionCost
            : 0;
        res.json({
            vehicleId,
            totalRevenue,
            totalMaintenance,
            totalExpenses,
            acquisitionCost,
            roi
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to calculate ROI' });
    }
});
// Fleet Status Counts
router.get('/fleet-status', async (req, res) => {
    try {
        const statusGroups = await prisma_1.default.vehicle.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });
        const statusCounts = statusGroups.map(group => ({
            status: group.status,
            count: group._count.status
        }));
        res.json(statusCounts);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to calculate fleet status' });
    }
});
exports.default = router;
//# sourceMappingURL=analytics.js.map