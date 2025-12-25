import { Router } from 'express';
import {
    getAllRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    checkAvailability,
} from '../controllers/room.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import {
    createRoomSchema,
    updateRoomSchema,
    getRoomSchema,
    checkAvailabilitySchema,
} from '../validators/room.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Meeting room management endpoints
 */

// Public routes
router.get('/', getAllRooms);
router.get('/:id/availability', validate(checkAvailabilitySchema), checkAvailability);

// Admin only routes
router.post('/', authenticate, requireAdmin, validate(createRoomSchema), createRoom);
router.put('/:id', authenticate, requireAdmin, validate(updateRoomSchema), updateRoom);
router.delete('/:id', authenticate, requireAdmin, validate(getRoomSchema), deleteRoom);

export default router;
