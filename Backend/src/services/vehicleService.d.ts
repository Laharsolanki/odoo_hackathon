/**
 * Vehicle Service — Business logic for vehicle operations.
 *
 * Handles unique registration validation, retirement, and availability.
 *
 * Owner: Member 3 (Integration Lead)
 */
/**
 * Validate unique registration number before create/update.
 */
export declare function assertUniqueRegistration(regNumber: string, excludeId?: string): Promise<void>;
/**
 * Retire a vehicle — terminal state transition.
 */
export declare function retireVehicle(vehicleId: string): Promise<{
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
}>;
/**
 * Guard: prevent deleting a vehicle that is currently on a trip.
 */
export declare function assertCanDeleteVehicle(vehicleId: string): Promise<void>;
//# sourceMappingURL=vehicleService.d.ts.map