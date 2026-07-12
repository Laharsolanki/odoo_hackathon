"use strict";
/**
 * Error Middleware — Global error handler for structured domain errors.
 *
 * Catches all business rule violations, validation failures,
 * and unexpected errors. Returns consistent JSON responses.
 *
 * Owner: Member 3 (Integration Lead)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    // Log error
    console.error(`❌ [${new Date().toISOString()}] ${err.code || 'UNKNOWN'}: ${err.message || err}`);
    // Handle our structured domain errors (from state machines / services)
    if (err.code && err.status) {
        res.status(err.status).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details || {},
            },
        });
        return;
    }
    // Handle Prisma known errors
    if (err.code === 'P2002') {
        const field = err.meta?.target?.[0] || 'field';
        res.status(409).json({
            success: false,
            error: {
                code: 'DUPLICATE_KEY',
                message: `Duplicate value for ${field}`,
                details: { field },
            },
        });
        return;
    }
    if (err.code === 'P2025') {
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: 'Record not found',
            },
        });
        return;
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token',
            },
        });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired',
            },
        });
        return;
    }
    // Fallback — unknown error
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
        },
    });
};
exports.errorHandler = errorHandler;
/**
 * Async handler wrapper — eliminates try-catch boilerplate in route handlers.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map