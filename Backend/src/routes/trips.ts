/**
 * Trip Routes — Enhanced with full business logic integration.
 * 
 * Before (Member 2): Bare CRUD with no validation.
 * After  (Member 3): Full state machine enforcement, dispatch guards,
 *                     cargo validation, resource management.
 * 
 * Owner: Member 3 (Integration Lead) — rewired from Member 2's scaffold
 */

import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticateJWT, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  getAvailableVehicles,
  getAvailableDrivers,
} from '../services/tripService';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['Fleet Manager']));

// Get all trips with optional filtering
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, vehicleId, driverId } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (vehicleId) where.vehicleId = vehicleId;
  if (driverId) where.driverId = driverId;

  const trips = await prisma.trip.findMany({
    where,
    include: { vehicle: true, driver: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(trips);
}));

// Get single trip
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const trip = await prisma.trip.findUnique({
    where: { id: req.params.id as string },
    include: { vehicle: true, driver: true },
  });
  if (!trip) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Trip not found' };
  }
  res.json(trip);
}));

// Get available vehicles for dispatch selection
router.get('/available/vehicles', asyncHandler(async (req: Request, res: Response) => {
  const vehicles = await getAvailableVehicles();
  res.json(vehicles);
}));

// Get available drivers for dispatch selection
router.get('/available/drivers', asyncHandler(async (req: Request, res: Response) => {
  const drivers = await getAvailableDrivers();
  res.json(drivers);
}));

// Create a new trip (status: Draft)
// ⭐ Enhanced: validates vehicle and driver existence
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue } = req.body;

  // Input validation
  if (!source || !destination) {
    throw { status: 400, code: 'VALIDATION_ERROR', message: 'Source and destination are required' };
  }
  if (!vehicleId || !driverId) {
    throw { status: 400, code: 'VALIDATION_ERROR', message: 'vehicleId and driverId are required' };
  }
  if (cargoWeight === undefined || cargoWeight < 0) {
    throw { status: 400, code: 'VALIDATION_ERROR', message: 'cargoWeight must be a non-negative number' };
  }
  if (!plannedDistance || plannedDistance <= 0) {
    throw { status: 400, code: 'VALIDATION_ERROR', message: 'plannedDistance must be a positive number' };
  }

  const trip = await createTrip({
    source,
    destination,
    vehicleId,
    driverId,
    cargoWeight,
    plannedDistance,
    revenue,
  });

  res.status(201).json(trip);
}));

// ⭐ DISPATCH a trip — the most critical endpoint
// Enforces: trip state, vehicle availability, driver availability,
//           license expiry, cargo capacity
router.put('/:id/dispatch', asyncHandler(async (req: Request, res: Response) => {
  const trip = await dispatchTrip(req.params.id as string);
  res.json({ success: true, message: 'Trip dispatched successfully', data: trip });
}));

// ⭐ COMPLETE a trip
// Restores vehicle and driver to Available
router.put('/:id/complete', asyncHandler(async (req: Request, res: Response) => {
  const trip = await completeTrip(req.params.id as string);
  res.json({ success: true, message: 'Trip completed successfully', data: trip });
}));

// ⭐ CANCEL a trip
// Restores resources if trip was dispatched
router.put('/:id/cancel', asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  const trip = await cancelTrip(req.params.id as string, reason);
  res.json({ success: true, message: 'Trip cancelled successfully', data: trip });
}));

// Legacy status update — REPLACED by specific endpoints above
// Kept for backward compatibility but validates via state machine
router.put('/:id/status', asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;

  if (status === 'Dispatched') {
    const trip = await dispatchTrip(req.params.id as string);
    return res.json(trip);
  }
  if (status === 'Completed') {
    const trip = await completeTrip(req.params.id as string);
    return res.json(trip);
  }
  if (status === 'Cancelled') {
    const trip = await cancelTrip(req.params.id as string);
    return res.json(trip);
  }

  throw { status: 400, code: 'VALIDATION_ERROR', message: `Invalid status: ${status}` };
}));

// Delete a trip — only allowed for Draft trips
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const trip = await prisma.trip.findUnique({ where: { id: req.params.id as string } });
  if (!trip) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Trip not found' };
  }
  if (trip.status !== 'Draft') {
    throw {
      status: 409,
      code: 'CANNOT_DELETE',
      message: 'Only draft trips can be deleted. Cancel the trip instead.',
      details: { currentStatus: trip.status },
    };
  }

  await prisma.trip.delete({ where: { id: req.params.id as string } });
  res.status(204).send();
}));

export default router;
