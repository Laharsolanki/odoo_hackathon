/**
 * Error Middleware — Global error handler for structured domain errors.
 *
 * Catches all business rule violations, validation failures,
 * and unexpected errors. Returns consistent JSON responses.
 *
 * Owner: Member 3 (Integration Lead)
 */
import { Request, Response, NextFunction } from 'express';
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
/**
 * Async handler wrapper — eliminates try-catch boilerplate in route handlers.
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map