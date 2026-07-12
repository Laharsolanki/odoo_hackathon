import { Router } from 'express';
import prisma from '../prisma';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['Fleet Manager', 'Safety Officer']));

// Get all maintenance logs
router.get('/', async (req, res) => {
  try {
    const logs = await prisma.maintenanceLog.findMany();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance logs' });
  }
});

// Create a maintenance log
router.post('/', async (req, res) => {
  try {
    const { vehicleId, description, startDate, endDate, status, cost } = req.body;
    const log = await prisma.maintenanceLog.create({
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
  } catch (error) {
    res.status(400).json({ error: 'Failed to create maintenance log' });
  }
});

// Update a maintenance log
router.put('/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const log = await prisma.maintenanceLog.update({
      where: { id: req.params.id },
      data
    });
    res.json(log);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update maintenance log' });
  }
});

// Delete a maintenance log
router.delete('/:id', async (req, res) => {
  try {
    await prisma.maintenanceLog.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete maintenance log' });
  }
});

export default router;
