"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusAfterMaintenanceClose = exports.assertCanEnterMaintenance = exports.assertVehicleDispatchable = exports.assertTransition = exports.canTransition = exports.VEHICLE_STATUSES = void 0;
exports.VEHICLE_STATUSES = {
    AVAILABLE: 'Available',
    ON_TRIP: 'On Trip',
    IN_SHOP: 'In Shop',
    RETIRED: 'Retired',
};
const TRANSITIONS = {
    [exports.VEHICLE_STATUSES.AVAILABLE]: [
        exports.VEHICLE_STATUSES.ON_TRIP,
        exports.VEHICLE_STATUSES.IN_SHOP,
        exports.VEHICLE_STATUSES.RETIRED,
    ],
    [exports.VEHICLE_STATUSES.ON_TRIP]: [
        exports.VEHICLE_STATUSES.AVAILABLE,
    ],
    [exports.VEHICLE_STATUSES.IN_SHOP]: [
        exports.VEHICLE_STATUSES.AVAILABLE,
        exports.VEHICLE_STATUSES.RETIRED,
    ],
    [exports.VEHICLE_STATUSES.RETIRED]: [], // Terminal state
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
            message: `Invalid vehicle status transition: ${from} → ${to}`,
            details: { entity: 'vehicle', from, to },
        };
    }
};
exports.assertTransition = assertTransition;
/**
 * Check if a vehicle can be dispatched for a trip.
 * Throws structured error if not.
 */
const assertVehicleDispatchable = (vehicle) => {
    if (vehicle.status === exports.VEHICLE_STATUSES.RETIRED) {
        throw {
            status: 409,
            code: 'VEH_NOT_AVAILABLE',
            message: 'Vehicle is not available for dispatch (Retired)',
            details: { vehicleId: vehicle.id, currentStatus: vehicle.status },
        };
    }
    if (vehicle.status === exports.VEHICLE_STATUSES.IN_SHOP) {
        throw {
            status: 409,
            code: 'VEH_NOT_AVAILABLE',
            message: 'Vehicle is not available for dispatch (In Shop)',
            details: { vehicleId: vehicle.id, currentStatus: vehicle.status },
        };
    }
    if (vehicle.status === exports.VEHICLE_STATUSES.ON_TRIP) {
        throw {
            status: 409,
            code: 'VEH_ON_TRIP',
            message: 'Vehicle is already on a trip',
            details: { vehicleId: vehicle.id },
        };
    }
    if (vehicle.status !== exports.VEHICLE_STATUSES.AVAILABLE) {
        throw {
            status: 409,
            code: 'VEH_NOT_AVAILABLE',
            message: `Vehicle is not available for dispatch (${vehicle.status})`,
            details: { vehicleId: vehicle.id, currentStatus: vehicle.status },
        };
    }
};
exports.assertVehicleDispatchable = assertVehicleDispatchable;
/**
 * Check if a vehicle can enter maintenance.
 */
const assertCanEnterMaintenance = (vehicle) => {
    if (vehicle.status === exports.VEHICLE_STATUSES.RETIRED) {
        throw {
            status: 409,
            code: 'VEH_NOT_AVAILABLE',
            message: 'Cannot open maintenance on a retired vehicle',
            details: { vehicleId: vehicle.id, currentStatus: vehicle.status },
        };
    }
    if (vehicle.status === exports.VEHICLE_STATUSES.IN_SHOP) {
        throw {
            status: 409,
            code: 'VEH_ALREADY_IN_SHOP',
            message: 'Vehicle is already in maintenance',
            details: { vehicleId: vehicle.id },
        };
    }
    if (vehicle.status === exports.VEHICLE_STATUSES.ON_TRIP) {
        throw {
            status: 409,
            code: 'INVALID_TRANSITION',
            message: 'Cannot start maintenance while vehicle is on a trip',
            details: { vehicleId: vehicle.id, from: vehicle.status, to: exports.VEHICLE_STATUSES.IN_SHOP },
        };
    }
    (0, exports.assertTransition)(vehicle.status, exports.VEHICLE_STATUSES.IN_SHOP);
};
exports.assertCanEnterMaintenance = assertCanEnterMaintenance;
/**
 * Determine status after maintenance closes.
 * If vehicle was retired during maintenance, stays Retired.
 */
const statusAfterMaintenanceClose = (vehicle) => {
    if (vehicle.status === exports.VEHICLE_STATUSES.RETIRED) {
        return exports.VEHICLE_STATUSES.RETIRED;
    }
    return exports.VEHICLE_STATUSES.AVAILABLE;
};
exports.statusAfterMaintenanceClose = statusAfterMaintenanceClose;
//# sourceMappingURL=vehicleStateMachine.js.map