/**
 * Vehicle Routes — Enhanced with unique registration validation,
 * retirement state machine, and delete guards.
 * 
 * Owner: Member 3 (Integration Lead)
 */

import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { assertUniqueRegistration, retireVehicle, assertCanDeleteVehicle } from '../services/vehicleService';
import { VEHICLE_STATUSES } from '../stateMachines/vehicleStateMachine';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['Fleet Manager']));

// Get all vehicles with optional filtering
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, type, search } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { registrationNumber: { contains: search as string } },
      { modelName: { contains: search as string } },
    ];
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json(vehicles);
}));

// ⭐ Get available vehicles (for dispatch dropdown)
router.get('/available', asyncHandler(async (req: Request, res: Response) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: VEHICLE_STATUSES.AVAILABLE },
  });
  res.json(vehicles);
}));

// Get a single vehicle
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: req.params.id as string },
  });
  if (!vehicle) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Vehicle not found' };
  }
  res.json(vehicle);
}));

// ⭐ Create — with unique registration validation
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { registrationNumber, modelName, type, maxLoadCapacity, odometer, acquisitionCost, status } = req.body;

  // Input validation
  if (!registrationNumber || !registrationNumber.trim()) {
    throw { status: 400, code: 'VALIDATION_ERROR', message: 'registrationNumber is required' };
  }
  if (!modelName || !modelName.trim()) {
    throw { status: 400, code: 'VALIDATION_ERROR', message: 'modelName is required' };
  }
  if (!maxLoadCapacity || maxLoadCapacity <= 0) {
    throw { status: 400, code: 'VALIDATION_ERROR', message: 'maxLoadCapacity must be a positive number' };
  }

  // ⭐ Business rule: unique registration number
  await assertUniqueRegistration(registrationNumber);

  const vehicle = await prisma.vehicle.create({
    data: {
      registrationNumber,
      modelName,
      type: type || 'truck',
      maxLoadCapacity,
      odometer: odometer || 0,
      acquisitionCost: acquisitionCost || 0,
      status: status || VEHICLE_STATUSES.AVAILABLE,
    },
  });
  res.status(201).json(vehicle);
}));

// ⭐ Update — with unique registration validation
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const data: any = { ...req.body };

  // Don't allow status changes through regular update — use specific endpoints
  delete data.status;

  // If registration number is changing, validate uniqueness
  if (data.registrationNumber) {
    await assertUniqueRegistration(data.registrationNumber, req.params.id as string);
  }

  const vehicle = await prisma.vehicle.update({
    where: { id: req.params.id as string },
    data,
  });
  res.json(vehicle);
}));

// ⭐ RETIRE a vehicle — terminal state transition
router.put('/:id/retire', asyncHandler(async (req: Request, res: Response) => {
  const vehicle = await retireVehicle(req.params.id as string);
  res.json({ success: true, message: 'Vehicle retired successfully', data: vehicle });
}));

// ⭐ Delete — with guard against deleting On Trip vehicles
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  await assertCanDeleteVehicle(req.params.id as string);
  await prisma.vehicle.delete({ where: { id: req.params.id as string } });
  res.status(204).send();
}));

export default router;
