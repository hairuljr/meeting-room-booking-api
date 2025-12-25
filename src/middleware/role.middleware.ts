import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors.util';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
        throw new ForbiddenError('Authentication required');
    }

    if (req.user.role !== 'ADMIN') {
        throw new ForbiddenError('Admin access required');
    }

    next();
};
