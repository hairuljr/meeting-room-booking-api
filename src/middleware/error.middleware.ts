import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors.util';
import { errorResponse } from '../utils/response.util';

export const errorHandler = (
    err: Error,
    res: Response,
    _next: NextFunction,
): Response => {
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Handle known operational errors
    if (err instanceof AppError) {
        if (err instanceof ValidationError) {
            return errorResponse(res, err.message, err.statusCode, err.errors);
        }
        return errorResponse(res, err.message, err.statusCode);
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as unknown as { code: string; meta?: { target?: string[] } };

        if (prismaError.code === 'P2002') {
            return errorResponse(
                res,
                `Duplicate value for ${prismaError.meta?.target?.join(', ') || 'field'}`,
                409,
            );
        }

        if (prismaError.code === 'P2025') {
            return errorResponse(res, 'Record not found', 404);
        }
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired', 401);
    }

    // Handle unknown errors
    console.error('Unhandled error:', err);
    return errorResponse(
        res,
        process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        500,
    );
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): Response => {
    return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
