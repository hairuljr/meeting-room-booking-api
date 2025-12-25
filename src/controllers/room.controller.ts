import { Request, Response, NextFunction } from 'express';
import { roomService } from '../services/room.service';
import { successResponse } from '../utils/response.util';
import { CreateRoomInput, UpdateRoomInput } from '../validators/room.validator';

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get all active rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: Daftar ruangan
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
export const getAllRooms = async (
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const rooms = await roomService.getAllRooms();
        successResponse(res, rooms);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room (Admin only)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Meeting Room C
 *               capacity:
 *                 type: integer
 *                 example: 15
 *               location:
 *                 type: string
 *                 example: Floor 3
 *               description:
 *                 type: string
 *                 example: Medium-sized meeting room
 *     responses:
 *       201:
 *         description: Ruangan berhasil dibuat
 *       403:
 *         description: Akses admin diperlukan
 */
export const createRoom = async (
    req: Request<object, object, CreateRoomInput>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const room = await roomService.createRoom(req.body);
        successResponse(res, room, 'Ruangan berhasil dibuat', 201);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /rooms/{id}:
 *   put:
 *     summary: Update a room (Admin only)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Meeting Room C
 *               capacity:
 *                 type: integer
 *                 example: 15
 *               location:
 *                 type: string
 *                 example: Floor 3
 *               description:
 *                 type: string
 *                 example: Medium-sized meeting room
 *     responses:
 *       200:
 *         description: Ruangan berhasil diperbarui
 *       404:
 *         description: Ruangan tidak ditemukan
 */
export const updateRoom = async (
    req: Request<{ id: string }, object, UpdateRoomInput>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const room = await roomService.updateRoom(req.params.id, req.body);
        successResponse(res, room, 'Ruangan berhasil diperbarui');
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete a room (Admin only)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ruangan berhasil dihapus
 *       404:
 *         description: Ruangan tidak ditemukan
 */
export const deleteRoom = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const result = await roomService.deleteRoom(req.params.id);
        successResponse(res, result);
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /rooms/{id}/availability:
 *   get:
 *     summary: Check room availability for a specific date
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-12-26
 *     responses:
 *       200:
 *         description: Informasi ketersediaan ruangan
 *       404:
 *         description: Ruangan tidak ditemukan
 */
export const checkAvailability = async (
    req: Request<{ id: string }, object, object, { date: string }>,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const availability = await roomService.checkAvailability(req.params.id, req.query.date);
        successResponse(res, availability);
    } catch (error) {
        next(error);
    }
};
