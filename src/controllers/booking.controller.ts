import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/booking.service';
import { successResponse } from '../utils/response.util';
import { CreateBookingInput } from '../validators/booking.validator';

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - startTime
 *               - endTime
 *             properties:
 *               roomId:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-26T09:00:00Z
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-26T11:00:00Z
 *               purpose:
 *                 type: string
 *                 example: Team meeting
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       409:
 *         description: Booking conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Ruangan sudah dibooking pada waktu tersebut
 *       400:
 *         description: Validation error
 */
export const createBooking = async (
    req: Request<object, object, CreateBookingInput>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        if (!req.user) {
            throw new Error('User not authenticated');
        }

        const booking = await bookingService.createBooking(req.user.userId, req.body);
        successResponse(res, booking, 'Booking created successfully', 201);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
export const getMyBookings = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        if (!req.user) {
            throw new Error('User not authenticated');
        }

        const bookings = await bookingService.getUserBookings(req.user.userId);
        successResponse(res, bookings);
    } catch (error) {
        next(error);
    }
};
