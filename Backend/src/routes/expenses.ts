import { Router } from 'express';
import prisma from '../prisma';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['Fleet Manager', 'Financial Analyst']));

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await prisma.expenseLog.findMany();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Create an expense
router.post('/', async (req, res) => {
  try {
    const { vehicleId, type, metricUnits, cost, date } = req.body;
    const data: any = {
      vehicleId,
      type,
      metricUnits,
      cost
    };
    if (date) {
      data.date = new Date(date);
    }
    const expense = await prisma.expenseLog.create({
      data
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create expense' });
  }
});

// Update an expense
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);

    const expense = await prisma.expenseLog.update({
      where: { id: req.params.id },
      data
    });
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update expense' });
  }
});

// Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    await prisma.expenseLog.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete expense' });
  }
});

export default router;
