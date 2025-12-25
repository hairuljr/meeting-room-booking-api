import { Response } from 'express';

interface SuccessResponse<T> {
    success: true;
    message?: string;
    data: T;
}

interface ErrorResponse {
    success: false;
    message: string;
    errors?: unknown[];
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: PaginationMeta;
}

export const successResponse = <T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200,
): Response<SuccessResponse<T>> => {
    return res.status(statusCode).json({
        success: true,
        ...(message && { message }),
        data,
    });
};

export const errorResponse = (
    res: Response,
    message: string,
    statusCode = 500,
    errors?: unknown[],
): Response<ErrorResponse> => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors }),
    });
};

export const paginatedResponse = <T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
): Response<PaginatedResponse<T>> => {
    return res.status(200).json({
        success: true,
        data,
        pagination,
    });
};
