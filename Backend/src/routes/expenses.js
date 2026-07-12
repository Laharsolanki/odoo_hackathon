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
// Get all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await prisma_1.default.expenseLog.findMany();
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});
// Create an expense
router.post('/', async (req, res) => {
    try {
        const { vehicleId, type, metricUnits, cost, date } = req.body;
        const data = {
            vehicleId,
            type,
            metricUnits,
            cost
        };
        if (date) {
            data.date = new Date(date);
        }
        const expense = await prisma_1.default.expenseLog.create({
            data
        });
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create expense' });
    }
});
// Update an expense
router.put('/:id', async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.date)
            data.date = new Date(data.date);
        const expense = await prisma_1.default.expenseLog.update({
            where: { id: req.params.id },
            data
        });
        res.json(expense);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update expense' });
    }
});
// Delete an expense
router.delete('/:id', async (req, res) => {
    try {
        await prisma_1.default.expenseLog.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete expense' });
    }
});
exports.default = router;
//# sourceMappingURL=expenses.js.map