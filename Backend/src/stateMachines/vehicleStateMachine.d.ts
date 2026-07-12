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
export declare const VEHICLE_STATUSES: {
    readonly AVAILABLE: 'Available';
    readonly ON_TRIP: 'On Trip';
    readonly IN_SHOP: 'In Shop';
    readonly RETIRED: 'Retired';
};
export type VehicleStatus = typeof VEHICLE_STATUSES[keyof typeof VEHICLE_STATUSES];
export declare const canTransition: (from: string, to: string) => boolean;
export declare const assertTransition: (from: string, to: string) => void;
/**
 * Check if a vehicle can be dispatched for a trip.
 * Throws structured error if not.
 */
export declare const assertVehicleDispatchable: (vehicle: any) => void;
/**
 * Check if a vehicle can enter maintenance.
 */
export declare const assertCanEnterMaintenance: (vehicle: any) => void;
/**
 * Determine status after maintenance closes.
 * If vehicle was retired during maintenance, stays Retired.
 */
export declare const statusAfterMaintenanceClose: (vehicle: any) => string;
//# sourceMappingURL=vehicleStateMachine.d.ts.map