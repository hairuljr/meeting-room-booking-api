import { z } from 'zod';

export const createBookingSchema = z.object({
    body: z.object({
        roomId: z.string().uuid('Invalid room ID format'),
        startTime: z.string().datetime('Invalid start time format'),
        endTime: z.string().datetime('Invalid end time format'),
        purpose: z.string().optional(),
    }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
