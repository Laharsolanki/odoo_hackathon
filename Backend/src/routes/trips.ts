import { Router } from 'express';
import prisma from '../prisma';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['Fleet Manager']));

// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await prisma.trip.findMany();
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Create a new trip
router.post('/', async (req, res) => {
  try {
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, status, revenue } = req.body;
    const trip = await prisma.trip.create({
      data: { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, status, revenue: revenue || 0 }
    });
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create trip' });
  }
});

// Update a trip (e.g., status updates)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(trip);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update trip status' });
  }
});

// Delete a trip
router.delete('/:id', async (req, res) => {
  try {
    await prisma.trip.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete trip' });
  }
});

export default router;
