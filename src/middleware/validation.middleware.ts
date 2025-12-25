import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.util';

export const validate = (schema: ZodSchema) => {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Safe access to errors
                const issues = (error as any).errors || [];
                const mappedErrors = issues.map((err: any) => ({
                    field: err.path ? err.path.join('.') : 'unknown',
                    message: err.message,
                }));
                next(new ValidationError('Validasi gagal', mappedErrors));
            } else {
                next(error);
            }
        }
    };
};
