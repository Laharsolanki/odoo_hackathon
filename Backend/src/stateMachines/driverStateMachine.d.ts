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
export declare const DRIVER_STATUSES: {
    readonly AVAILABLE: 'Available';
    readonly ON_TRIP: 'On Trip';
    readonly OFF_DUTY: 'Off Duty';
    readonly SUSPENDED: 'Suspended';
};
export type DriverStatus = typeof DRIVER_STATUSES[keyof typeof DRIVER_STATUSES];
export declare const canTransition: (from: string, to: string) => boolean;
export declare const assertTransition: (from: string, to: string) => void;
/**
 * Check if a driver can be dispatched.
 * Guards: must be Available, license must not be expired, must not be suspended.
 */
export declare const assertDriverDispatchable: (driver: any) => void;
//# sourceMappingURL=driverStateMachine.d.ts.map