/**
 * Driver State Machine
 * 
 * Defines all legal status transitions for drivers.
 * Includes license expiry check as a dispatch guard.
 * 
 * States: Available | On Trip | Off Duty | Suspended
 * 
 * Owner: Member 3 (Integration Lead)
 */

export const DRIVER_STATUSES = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  OFF_DUTY: 'Off Duty',
  SUSPENDED: 'Suspended',
} as const;

export type DriverStatus = typeof DRIVER_STATUSES[keyof typeof DRIVER_STATUSES];

const TRANSITIONS: Record<string, string[]> = {
  [DRIVER_STATUSES.AVAILABLE]: [
    DRIVER_STATUSES.ON_TRIP,
    DRIVER_STATUSES.OFF_DUTY,
    DRIVER_STATUSES.SUSPENDED,
  ],
  [DRIVER_STATUSES.ON_TRIP]: [
    DRIVER_STATUSES.AVAILABLE,
  ],
  [DRIVER_STATUSES.OFF_DUTY]: [
    DRIVER_STATUSES.AVAILABLE,
  ],
  [DRIVER_STATUSES.SUSPENDED]: [
    DRIVER_STATUSES.AVAILABLE,
  ],
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
      message: `Invalid driver status transition: ${from} → ${to}`,
      details: { entity: 'driver', from, to },
    };
  }
};

/**
 * Check if a driver can be dispatched.
 * Guards: must be Available, license must not be expired, must not be suspended.
 */
export const assertDriverDispatchable = (driver: any): void => {
  if (driver.status === DRIVER_STATUSES.SUSPENDED) {
    throw {
      status: 409,
      code: 'DRV_SUSPENDED',
      message: 'Driver is suspended',
      details: { driverId: driver.id },
    };
  }

  if (driver.status === DRIVER_STATUSES.ON_TRIP) {
    throw {
      status: 409,
      code: 'DRV_ON_TRIP',
      message: 'Driver is already on a trip',
      details: { driverId: driver.id },
    };
  }

  if (driver.status !== DRIVER_STATUSES.AVAILABLE) {
    throw {
      status: 409,
      code: 'DRV_NOT_AVAILABLE',
      message: `Driver is not available for dispatch (${driver.status})`,
      details: { driverId: driver.id, currentStatus: driver.status },
    };
  }

  // License expiry check
  const now = new Date();
  if (driver.licenseExpiryDate && new Date(driver.licenseExpiryDate) < now) {
    throw {
      status: 409,
      code: 'DRV_LICENSE_EXPIRED',
      message: 'Driver license has expired',
      details: { driverId: driver.id, licenseExpiry: driver.licenseExpiryDate },
    };
  }
};
