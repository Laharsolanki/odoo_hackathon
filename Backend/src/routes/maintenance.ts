/**
 * Maintenance Routes — Enhanced with vehicle state machine integration.
 * 
 * Before (Member 2): Bare CRUD, no vehicle status management.
 * After  (Member 3): open → vehicle In Shop, close → vehicle Available.
 * 
 * Owner: Member 3 (Integration Lead)
 */

import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { openMaintenance, closeMaintenance } from '../services/maintenanceService';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['Fleet Manager', 'Safety Officer']));

// Get all maintenance logs
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, vehicleId } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (vehicleId) where.vehicleId = vehicleId;

  const logs = await prisma.maintenanceLog.findMany({
    where,
    include: { vehicle: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(logs);
}));

// Get single maintenance record
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id: req.params.id as string },
    include: { vehicle: true },
  });
  if (!log) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Maintenance record not found' };
  }
  res.json(log);
}));

// ⭐ OPEN maintenance — sets vehicle to In Shop
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { vehicleId, description, startDate, cost } = req.body;

  // Input validation
  if (!vehicleId) {
    throw { status: 400, code: 'VALIDATION_ERROR', message: 'vehicleId is required' };
  }
  if (!description || !description.trim()) {
    throw { status: 400, code: 'VALIDATION_ERROR', message: 'description is required' };
  }
  if (!startDate) {
    throw { status: 400, code: 'VALIDATION_ERROR', message: 'startDate is required' };
  }

  const log = await openMaintenance({ vehicleId, description, startDate, cost });
  res.status(201).json({ success: true, message: 'Maintenance opened, vehicle set to In Shop', data: log });
}));

// ⭐ CLOSE maintenance — restores vehicle to Available (unless Retired)
router.put('/:id/close', asyncHandler(async (req: Request, res: Response) => {
  const { cost } = req.body;
  const log = await closeMaintenance(req.params.id as string, cost);
  res.json({ success: true, message: 'Maintenance closed, vehicle status restored', data: log });
}));

// Update a maintenance log (generic fields only — status changes go through /close)
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const data: any = { ...req.body };

  // Prevent direct status changes — must use /close endpoint
  if (data.status === 'Closed') {
    throw {
      status: 400,
      code: 'USE_CLOSE_ENDPOINT',
      message: 'To close maintenance, use PUT /maintenance/:id/close instead',
    };
  }

  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);

  const log = await prisma.maintenanceLog.update({
    where: { id: req.params.id as string },
    data,
    include: { vehicle: true },
  });
  res.json(log);
}));

// Delete a maintenance log — only allowed for Open records
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const log = await prisma.maintenanceLog.findUnique({ where: { id: req.params.id as string } });
  if (!log) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Maintenance record not found' };
  }
  if (log.status === 'Closed') {
    throw { status: 409, code: 'CANNOT_DELETE', message: 'Closed maintenance records cannot be deleted' };
  }

  await prisma.maintenanceLog.delete({ where: { id: req.params.id as string } });
  res.status(204).send();
}));

export default router;
