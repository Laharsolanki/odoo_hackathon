"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertDriverDispatchable = exports.assertTransition = exports.canTransition = exports.DRIVER_STATUSES = void 0;
exports.DRIVER_STATUSES = {
    AVAILABLE: 'Available',
    ON_TRIP: 'On Trip',
    OFF_DUTY: 'Off Duty',
    SUSPENDED: 'Suspended',
};
const TRANSITIONS = {
    [exports.DRIVER_STATUSES.AVAILABLE]: [
        exports.DRIVER_STATUSES.ON_TRIP,
        exports.DRIVER_STATUSES.OFF_DUTY,
        exports.DRIVER_STATUSES.SUSPENDED,
    ],
    [exports.DRIVER_STATUSES.ON_TRIP]: [
        exports.DRIVER_STATUSES.AVAILABLE,
    ],
    [exports.DRIVER_STATUSES.OFF_DUTY]: [
        exports.DRIVER_STATUSES.AVAILABLE,
    ],
    [exports.DRIVER_STATUSES.SUSPENDED]: [
        exports.DRIVER_STATUSES.AVAILABLE,
    ],
};
const canTransition = (from, to) => {
    const allowed = TRANSITIONS[from];
    if (!allowed)
        return false;
    return allowed.includes(to);
};
exports.canTransition = canTransition;
const assertTransition = (from, to) => {
    if (!(0, exports.canTransition)(from, to)) {
        throw {
            status: 409,
            code: 'INVALID_TRANSITION',
            message: `Invalid driver status transition: ${from} → ${to}`,
            details: { entity: 'driver', from, to },
        };
    }
};
exports.assertTransition = assertTransition;
/**
 * Check if a driver can be dispatched.
 * Guards: must be Available, license must not be expired, must not be suspended.
 */
const assertDriverDispatchable = (driver) => {
    if (driver.status === exports.DRIVER_STATUSES.SUSPENDED) {
        throw {
            status: 409,
            code: 'DRV_SUSPENDED',
            message: 'Driver is suspended',
            details: { driverId: driver.id },
        };
    }
    if (driver.status === exports.DRIVER_STATUSES.ON_TRIP) {
        throw {
            status: 409,
            code: 'DRV_ON_TRIP',
            message: 'Driver is already on a trip',
            details: { driverId: driver.id },
        };
    }
    if (driver.status !== exports.DRIVER_STATUSES.AVAILABLE) {
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
exports.assertDriverDispatchable = assertDriverDispatchable;
//# sourceMappingURL=driverStateMachine.js.map