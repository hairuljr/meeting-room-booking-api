import { z } from 'zod';

export const createRoomSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Room name is required'),
        capacity: z.number().int().positive('Capacity must be a positive number'),
        location: z.string().optional(),
        description: z.string().optional(),
    }),
});

export const updateRoomSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid room ID format'),
    }),
    body: z.object({
        name: z.string().min(1, 'Room name is required').optional(),
        capacity: z.number().int().positive('Capacity must be a positive number').optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const getRoomSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid room ID format'),
    }),
});

export const checkAvailabilitySchema = z.object({
    params: z.object({
        id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid room ID format'),
    }),
    query: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    }),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>['body'];
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>['body'];
