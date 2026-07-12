"use strict";
/**
 * Trip State Machine
 *
 * Defines the trip lifecycle: Draft → Dispatched → Completed / Cancelled
 * Completed and Cancelled are terminal states.
 *
 * States: Draft | Dispatched | Completed | Cancelled
 * (Matches existing Prisma schema)
 *
 * Owner: Member 3 (Integration Lead)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTerminal = exports.isActive = exports.assertTransition = exports.canTransition = exports.TRIP_STATUSES = void 0;
exports.TRIP_STATUSES = {
    DRAFT: 'Draft',
    DISPATCHED: 'Dispatched',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
};
const TRANSITIONS = {
    [exports.TRIP_STATUSES.DRAFT]: [
        exports.TRIP_STATUSES.DISPATCHED,
        exports.TRIP_STATUSES.CANCELLED,
    ],
    [exports.TRIP_STATUSES.DISPATCHED]: [
        exports.TRIP_STATUSES.COMPLETED,
        exports.TRIP_STATUSES.CANCELLED,
    ],
    [exports.TRIP_STATUSES.COMPLETED]: [], // Terminal
    [exports.TRIP_STATUSES.CANCELLED]: [], // Terminal
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
        if (from === exports.TRIP_STATUSES.COMPLETED) {
            throw {
                status: 409,
                code: 'TRIP_ALREADY_DONE',
                message: 'Trip is already completed',
                details: { from, to },
            };
        }
        if (from === exports.TRIP_STATUSES.CANCELLED) {
            throw {
                status: 409,
                code: 'TRIP_ALREADY_CANCELLED',
                message: 'Trip is already cancelled',
                details: { from, to },
            };
        }
        throw {
            status: 409,
            code: 'INVALID_TRANSITION',
            message: `Invalid trip status transition: ${from} → ${to}`,
            details: { entity: 'trip', from, to },
        };
    }
};
exports.assertTransition = assertTransition;
/**
 * Is the trip in an active state where vehicle/driver are occupied?
 */
const isActive = (status) => {
    return status === exports.TRIP_STATUSES.DISPATCHED;
};
exports.isActive = isActive;
/**
 * Is the trip in a terminal state?
 */
const isTerminal = (status) => {
    return [exports.TRIP_STATUSES.COMPLETED, exports.TRIP_STATUSES.CANCELLED].includes(status);
};
exports.isTerminal = isTerminal;
//# sourceMappingURL=tripStateMachine.js.map