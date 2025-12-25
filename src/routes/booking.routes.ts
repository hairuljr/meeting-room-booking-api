import { Router } from 'express';
import { createBooking, getMyBookings } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createBookingSchema } from '../validators/booking.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Meeting room booking endpoints
 */

// All booking routes require authentication
router.use(authenticate);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/my', getMyBookings);

export default router;
