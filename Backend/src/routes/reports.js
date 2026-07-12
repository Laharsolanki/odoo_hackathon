"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const json2csv_1 = require("json2csv");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.use((0, auth_1.requireRole)(['Fleet Manager', 'Financial Analyst']));
router.get('/export', async (req, res) => {
    try {
        const { type, startDate, endDate, vehicleType } = req.query;
        if (!type) {
            return res.status(400).json({ error: 'Missing report type (e.g., type=trips or type=vehicles)' });
        }
        let data = [];
        let filename = 'export.csv';
        if (type === 'trips') {
            const where = {};
            if (startDate && endDate) {
                where.createdAt = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }
            const trips = await prisma_1.default.trip.findMany({
                where,
                include: { vehicle: true, driver: true }
            });
            data = trips.map(t => ({
                ID: t.id,
                Source: t.source,
                Destination: t.destination,
                VehicleRegistration: t.vehicle?.registrationNumber,
                DriverName: t.driver?.name,
                CargoWeight: t.cargoWeight,
                PlannedDistance: t.plannedDistance,
                Revenue: t.revenue,
                Status: t.status,
                Date: t.createdAt.toISOString()
            }));
            filename = 'trips_report.csv';
        }
        else if (type === 'vehicles') {
            const where = {};
            if (vehicleType) {
                where.type = vehicleType;
            }
            data = await prisma_1.default.vehicle.findMany({ where });
            filename = 'vehicles_report.csv';
        }
        else if (type === 'expenses') {
            const where = {};
            if (startDate && endDate) {
                where.date = {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                };
            }
            const expenses = await prisma_1.default.expenseLog.findMany({
                where,
                include: { vehicle: true }
            });
            data = expenses.map(e => ({
                ID: e.id,
                VehicleRegistration: e.vehicle?.registrationNumber,
                Type: e.type,
                MetricUnits: e.metricUnits,
                Cost: e.cost,
                Date: e.date.toISOString()
            }));
            filename = 'expenses_report.csv';
        }
        else {
            return res.status(400).json({ error: 'Invalid report type' });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: 'No data found for the given criteria' });
        }
        const csv = (0, json2csv_1.parse)(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.status(200).send(csv);
    }
    catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map