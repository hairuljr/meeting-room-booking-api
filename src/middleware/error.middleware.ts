import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors.util';
import { errorResponse } from '../utils/response.util';

export const errorHandler = (
    err: Error,
    _req: Request,
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
                `Nilai duplikat untuk ${prismaError.meta?.target?.join(', ') || 'field'}`,
                409,
            );
        }

        if (prismaError.code === 'P2025') {
            return errorResponse(res, 'Data tidak ditemukan', 404);
        }
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Token tidak valid', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token kedaluwarsa', 401);
    }

    // Handle unknown errors
    console.error('Unhandled error:', err);
    return errorResponse(
        res,
        process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan internal server' : err.message,
        500,
    );
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): Response => {
    return errorResponse(res, `Rute ${req.originalUrl} tidak ditemukan`, 404);
};
