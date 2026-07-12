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

export const TRIP_STATUSES = {
  DRAFT: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

export type TripStatus = typeof TRIP_STATUSES[keyof typeof TRIP_STATUSES];

const TRANSITIONS: Record<string, string[]> = {
  [TRIP_STATUSES.DRAFT]: [
    TRIP_STATUSES.DISPATCHED,
    TRIP_STATUSES.CANCELLED,
  ],
  [TRIP_STATUSES.DISPATCHED]: [
    TRIP_STATUSES.COMPLETED,
    TRIP_STATUSES.CANCELLED,
  ],
  [TRIP_STATUSES.COMPLETED]: [],  // Terminal
  [TRIP_STATUSES.CANCELLED]: [],  // Terminal
};

export const canTransition = (from: string, to: string): boolean => {
  const allowed = TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
};

export const assertTransition = (from: string, to: string): void => {
  if (!canTransition(from, to)) {
    if (from === TRIP_STATUSES.COMPLETED) {
      throw {
        status: 409,
        code: 'TRIP_ALREADY_DONE',
        message: 'Trip is already completed',
        details: { from, to },
      };
    }
    if (from === TRIP_STATUSES.CANCELLED) {
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

/**
 * Is the trip in an active state where vehicle/driver are occupied?
 */
export const isActive = (status: string): boolean => {
  return status === TRIP_STATUSES.DISPATCHED;
};

/**
 * Is the trip in a terminal state?
 */
export const isTerminal = (status: string): boolean => {
  return [TRIP_STATUSES.COMPLETED, TRIP_STATUSES.CANCELLED].includes(status as any);
};
