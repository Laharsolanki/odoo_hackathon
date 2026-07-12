/**
 * Maintenance Service — Business logic for maintenance lifecycle.
 * 
 * Open maintenance → Vehicle goes to In Shop
 * Close maintenance → Vehicle restored to Available (unless Retired)
 * 
 * Owner: Member 3 (Integration Lead)
 */

import prisma from '../prisma';
import {
  VEHICLE_STATUSES,
  assertCanEnterMaintenance,
  statusAfterMaintenanceClose,
} from '../stateMachines/vehicleStateMachine';

export interface OpenMaintenanceInput {
  vehicleId: string;
  description: string;
  startDate: string | Date;
  cost?: number;
}

/**
 * OPEN a maintenance record.
 * 
 * Guards:
 * 1. Vehicle must exist
 * 2. Vehicle must not be Retired
 * 3. Vehicle must not already be In Shop
 * 4. Vehicle must not be On Trip
 * 
 * Side effects:
 * - Vehicle status → In Shop
 * - Maintenance record created with status Open
 */
export async function openMaintenance(data: OpenMaintenanceInput) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Vehicle not found' };
  }

  // Validate vehicle can enter maintenance
  assertCanEnterMaintenance(vehicle);

  // Use transaction for atomicity
  const [maintenance] = await prisma.$transaction([
    prisma.maintenanceLog.create({
      data: {
        vehicleId: data.vehicleId,
        description: data.description,
        startDate: new Date(data.startDate),
        status: 'Open',
        cost: data.cost || 0,
      },
      include: { vehicle: true },
    }),
    prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: VEHICLE_STATUSES.IN_SHOP },
    }),
  ]);

  return maintenance;
}

/**
 * CLOSE a maintenance record.
 * 
 * Guards:
 * 1. Maintenance record must exist
 * 2. Maintenance must not already be Closed
 * 
 * Side effects:
 * - Maintenance status → Closed, endDate set
 * - Vehicle status → Available (unless Retired)
 */
export async function closeMaintenance(maintenanceId: string, cost?: number) {
  const maintenance = await prisma.maintenanceLog.findUnique({
    where: { id: maintenanceId },
    include: { vehicle: true },
  });

  if (!maintenance) {
    throw { status: 404, code: 'NOT_FOUND', message: 'Maintenance record not found' };
  }

  if (maintenance.status === 'Closed') {
    throw {
      status: 409,
      code: 'MAINT_ALREADY_CLOSED',
      message: 'Maintenance record is already closed',
      details: { maintenanceId },
    };
  }

  const newVehicleStatus = statusAfterMaintenanceClose(maintenance.vehicle);

  const [updatedMaintenance] = await prisma.$transaction([
    prisma.maintenanceLog.update({
      where: { id: maintenanceId },
      data: {
        status: 'Closed',
        endDate: new Date(),
        cost: cost !== undefined ? cost : maintenance.cost,
      },
      include: { vehicle: true },
    }),
    prisma.vehicle.update({
      where: { id: maintenance.vehicleId },
      data: { status: newVehicleStatus },
    }),
  ]);

  return updatedMaintenance;
}
