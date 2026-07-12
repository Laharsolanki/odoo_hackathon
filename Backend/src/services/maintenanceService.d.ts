/**
 * Maintenance Service — Business logic for maintenance lifecycle.
 *
 * Open maintenance → Vehicle goes to In Shop
 * Close maintenance → Vehicle restored to Available (unless Retired)
 *
 * Owner: Member 3 (Integration Lead)
 */
export interface OpenMaintenanceInput {
    vehicleId: string;
    description: string;
    startDate: string | Date;
    cost?: number;
}
/**
 * OPEN a maintenance record.
 *
 * Guards:
 * 1. Vehicle must exist
 * 2. Vehicle must not be Retired
 * 3. Vehicle must not already be In Shop
 * 4. Vehicle must not be On Trip
 *
 * Side effects:
 * - Vehicle status → In Shop
 * - Maintenance record created with status Open
 */
export declare function openMaintenance(data: OpenMaintenanceInput): Promise<{
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
    vehicleId: string;
    description: string;
    startDate: Date;
    endDate: Date | null;
    status: string;
    cost: number;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * CLOSE a maintenance record.
 *
 * Guards:
 * 1. Maintenance record must exist
 * 2. Maintenance must not already be Closed
 *
 * Side effects:
 * - Maintenance status → Closed, endDate set
 * - Vehicle status → Available (unless Retired)
 */
export declare function closeMaintenance(maintenanceId: string, cost?: number): Promise<{
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
    vehicleId: string;
    description: string;
    startDate: Date;
    endDate: Date | null;
    status: string;
    cost: number;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=maintenanceService.d.ts.map