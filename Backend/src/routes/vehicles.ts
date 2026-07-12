import { Router } from 'express';
import prisma from '../prisma';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Only Fleet Manager can manage vehicle registry
router.use(authenticateJWT);
router.use(requireRole(['Fleet Manager']));

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get a single vehicle
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: req.params.id }
    });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Create a new vehicle
router.post('/', async (req, res) => {
  try {
    const { registrationNumber, modelName, type, maxLoadCapacity, odometer, acquisitionCost, status } = req.body;
    const vehicle = await prisma.vehicle.create({
      data: { registrationNumber, modelName, type, maxLoadCapacity, odometer, acquisitionCost, status }
    });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create vehicle, check registration number uniqueness' });
  }
});

// Update a vehicle
router.put('/:id', async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update vehicle' });
  }
});

// Delete a vehicle
router.delete('/:id', async (req, res) => {
  try {
    await prisma.vehicle.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;
