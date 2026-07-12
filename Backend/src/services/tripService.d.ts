/**
 * Trip Service — Core business logic for trip lifecycle.
 *
 * This is the MOST CRITICAL file in the entire system.
 * Handles dispatch, complete, cancel with full state machine enforcement,
 * cargo validation, and vehicle/driver status management.
 *
 * Owner: Member 3 (Integration Lead)
 */
export interface CreateTripInput {
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: number;
    plannedDistance: number;
    revenue?: number;
}
/**
 * Create a trip as Draft — does NOT dispatch.
 * Validates that vehicle and driver exist but does NOT lock them.
 */
export declare function createTrip(data: CreateTripInput): Promise<{
    driver: {
        id: string;
        name: string;
        licenseNumber: string;
        licenseCategory: string;
        licenseExpiryDate: Date;
        contactNumber: string;
        safetyScore: number;
        status: string;
        userId: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
    vehicle: {
        id: string;
        registrationNumber: string;
        modelName: string;
        type: string;
        maxLoadCapacity: number;
        odometer: number;
        acquisitionCost: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: string;
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: number;
    plannedDistance: number;
    revenue: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * DISPATCH a trip.
 *
 * This is the most validation-heavy operation in the system.
 *
 * Guards:
 * 1. Trip must be in Draft status
 * 2. Vehicle must be Available (not Retired, In Shop, or On Trip)
 * 3. Driver must be Available (not Suspended, On Trip, Off Duty)
 * 4. Driver license must not be expired
 * 5. Cargo weight must not exceed vehicle max load capacity
 *
 * Side effects:
 * - Trip status → Dispatched
 * - Vehicle status → On Trip
 * - Driver status → On Trip
 */
export declare function dispatchTrip(tripId: string): Promise<{
    driver: {
        id: string;
        name: string;
        licenseNumber: string;
        licenseCategory: string;
        licenseExpiryDate: Date;
        contactNumber: string;
        safetyScore: number;
        status: string;
        userId: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
    vehicle: {
        id: string;
        registrationNumber: string;
        modelName: string;
        type: string;
        maxLoadCapacity: number;
        odometer: number;
        acquisitionCost: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: string;
    source: string;
    destination: string;
    vehicleId: string;
    driverId: string;
    cargoWeight: number;
    plannedDistance: number;
    revenue: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * COMPLETE a trip.
 *
 * Side effects:
 * - Trip status → Completed
 * - Vehicle status → Available
 * - Driver status → Available
 */
export declare function completeTrip(tripId: string): Promise<any>;
/**
 * CANCEL a trip.
 *
 * If the trip was dispatched (vehicle/driver are On Trip),
 * restores both to Available.
 * If the trip was only Draft, no resource restoration needed.
 */
export declare function cancelTrip(tripId: string, cancelReason?: string): Promise<any>;
/**
 * Get available vehicles for dispatch selection.
 * Excludes Retired and In Shop vehicles.
 */
export declare function getAvailableVehicles(): Promise<{
    id: string;
    registrationNumber: string;
    modelName: string;
    type: string;
    maxLoadCapacity: number;
    odometer: number;
    acquisitionCost: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}[]>;
/**
 * Get available drivers for dispatch selection.
 * Excludes Suspended, On Trip, Off Duty, and expired license drivers.
 */
export declare function getAvailableDrivers(): Promise<{
    id: string;
    name: string;
    licenseNumber: string;
    licenseCategory: string;
    licenseExpiryDate: Date;
    contactNumber: string;
    safetyScore: number;
    status: string;
    userId: string | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
//# sourceMappingURL=tripService.d.ts.map