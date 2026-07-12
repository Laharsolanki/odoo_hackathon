/**
 * Vehicle State Machine
 * 
 * Defines all legal status transitions for vehicles and enforces guards.
 * Single source of truth for vehicle lifecycle rules.
 * 
 * States: Available | On Trip | In Shop | Retired
 * 
 * Owner: Member 3 (Integration Lead)
 */

export const VEHICLE_STATUSES = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  IN_SHOP: 'In Shop',
  RETIRED: 'Retired',
} as const;

export type VehicleStatus = typeof VEHICLE_STATUSES[keyof typeof VEHICLE_STATUSES];

const TRANSITIONS: Record<string, string[]> = {
  [VEHICLE_STATUSES.AVAILABLE]: [
    VEHICLE_STATUSES.ON_TRIP,
    VEHICLE_STATUSES.IN_SHOP,
    VEHICLE_STATUSES.RETIRED,
  ],
  [VEHICLE_STATUSES.ON_TRIP]: [
    VEHICLE_STATUSES.AVAILABLE,
  ],
  [VEHICLE_STATUSES.IN_SHOP]: [
    VEHICLE_STATUSES.AVAILABLE,
    VEHICLE_STATUSES.RETIRED,
  ],
  [VEHICLE_STATUSES.RETIRED]: [],  // Terminal state
};

export const canTransition = (from: string, to: string): boolean => {
  const allowed = TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
};

export const assertTransition = (from: string, to: string): void => {
  if (!canTransition(from, to)) {
    throw {
      status: 409,
      code: 'INVALID_TRANSITION',
      message: `Invalid vehicle status transition: ${from} → ${to}`,
      details: { entity: 'vehicle', from, to },
    };
  }
};

/**
 * Check if a vehicle can be dispatched for a trip.
 * Throws structured error if not.
 */
export const assertVehicleDispatchable = (vehicle: any): void => {
  if (vehicle.status === VEHICLE_STATUSES.RETIRED) {
    throw {
      status: 409,
      code: 'VEH_NOT_AVAILABLE',
      message: 'Vehicle is not available for dispatch (Retired)',
      details: { vehicleId: vehicle.id, currentStatus: vehicle.status },
    };
  }
  if (vehicle.status === VEHICLE_STATUSES.IN_SHOP) {
    throw {
      status: 409,
      code: 'VEH_NOT_AVAILABLE',
      message: 'Vehicle is not available for dispatch (In Shop)',
      details: { vehicleId: vehicle.id, currentStatus: vehicle.status },
    };
  }
  if (vehicle.status === VEHICLE_STATUSES.ON_TRIP) {
    throw {
      status: 409,
      code: 'VEH_ON_TRIP',
      message: 'Vehicle is already on a trip',
      details: { vehicleId: vehicle.id },
    };
  }
  if (vehicle.status !== VEHICLE_STATUSES.AVAILABLE) {
    throw {
      status: 409,
      code: 'VEH_NOT_AVAILABLE',
      message: `Vehicle is not available for dispatch (${vehicle.status})`,
      details: { vehicleId: vehicle.id, currentStatus: vehicle.status },
    };
  }
};

/**
 * Check if a vehicle can enter maintenance.
 */
export const assertCanEnterMaintenance = (vehicle: any): void => {
  if (vehicle.status === VEHICLE_STATUSES.RETIRED) {
    throw {
      status: 409,
      code: 'VEH_NOT_AVAILABLE',
      message: 'Cannot open maintenance on a retired vehicle',
      details: { vehicleId: vehicle.id, currentStatus: vehicle.status },
    };
  }
  if (vehicle.status === VEHICLE_STATUSES.IN_SHOP) {
    throw {
      status: 409,
      code: 'VEH_ALREADY_IN_SHOP',
      message: 'Vehicle is already in maintenance',
      details: { vehicleId: vehicle.id },
    };
  }
  if (vehicle.status === VEHICLE_STATUSES.ON_TRIP) {
    throw {
      status: 409,
      code: 'INVALID_TRANSITION',
      message: 'Cannot start maintenance while vehicle is on a trip',
      details: { vehicleId: vehicle.id, from: vehicle.status, to: VEHICLE_STATUSES.IN_SHOP },
    };
  }
  assertTransition(vehicle.status, VEHICLE_STATUSES.IN_SHOP);
};

/**
 * Determine status after maintenance closes.
 * If vehicle was retired during maintenance, stays Retired.
 */
export const statusAfterMaintenanceClose = (vehicle: any): string => {
  if (vehicle.status === VEHICLE_STATUSES.RETIRED) {
    return VEHICLE_STATUSES.RETIRED;
  }
  return VEHICLE_STATUSES.AVAILABLE;
};
