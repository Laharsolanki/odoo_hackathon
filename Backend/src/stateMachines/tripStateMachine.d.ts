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
export declare const TRIP_STATUSES: {
    readonly DRAFT: 'Draft';
    readonly DISPATCHED: 'Dispatched';
    readonly COMPLETED: 'Completed';
    readonly CANCELLED: 'Cancelled';
};
export type TripStatus = typeof TRIP_STATUSES[keyof typeof TRIP_STATUSES];
export declare const canTransition: (from: string, to: string) => boolean;
export declare const assertTransition: (from: string, to: string) => void;
/**
 * Is the trip in an active state where vehicle/driver are occupied?
 */
export declare const isActive: (status: string) => boolean;
/**
 * Is the trip in a terminal state?
 */
export declare const isTerminal: (status: string) => boolean;
//# sourceMappingURL=tripStateMachine.d.ts.map