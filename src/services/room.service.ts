import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors.util';
import { CreateRoomInput, UpdateRoomInput } from '../validators/room.validator';

export class RoomService {
    async getAllRooms() {
        const rooms = await prisma.room.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });

        return rooms;
    }

    async getRoomById(id: string) {
        const room = await prisma.room.findUnique({
            where: { id },
        });

        if (!room || !room.isActive) {
            throw new NotFoundError('Room not found');
        }

        return room;
    }

    async createRoom(data: CreateRoomInput) {
        // Check if room name already exists
        const existingRoom = await prisma.room.findFirst({
            where: { name: data.name, isActive: true },
        });

        if (existingRoom) {
            throw new ValidationError('Room with this name already exists');
        }

        const room = await prisma.room.create({
            data,
        });

        return room;
    }

    async updateRoom(id: string, data: UpdateRoomInput) {
        // Check if room exists
        const room = await this.getRoomById(id);

        // If updating name, check for duplicates
        if (data.name && data.name !== room.name) {
            const existingRoom = await prisma.room.findFirst({
                where: { name: data.name, isActive: true, id: { not: id } },
            });

            if (existingRoom) {
                throw new ValidationError('Room with this name already exists');
            }
        }

        const updatedRoom = await prisma.room.update({
            where: { id },
            data,
        });

        return updatedRoom;
    }

    async deleteRoom(id: string) {
        // Check if room exists
        await this.getRoomById(id);

        // Soft delete - set isActive to false
        await prisma.room.update({
            where: { id },
            data: { isActive: false },
        });

        return { message: 'Room deleted successfully' };
    }

    async checkAvailability(id: string, date: string) {
        // Check if room exists
        await this.getRoomById(id);

        // Parse date
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        // Get all bookings for this room on the specified date
        const bookings = await prisma.booking.findMany({
            where: {
                roomId: id,
                status: { not: 'CANCELLED' },
                OR: [
                    {
                        AND: [
                            { startTime: { gte: startOfDay } },
                            { startTime: { lte: endOfDay } },
                        ],
                    },
                    {
                        AND: [
                            { endTime: { gte: startOfDay } },
                            { endTime: { lte: endOfDay } },
                        ],
                    },
                ],
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                purpose: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: { startTime: 'asc' },
        });

        return {
            date,
            isAvailable: bookings.length === 0,
            bookings: bookings.map((booking) => ({
                id: booking.id,
                startTime: booking.startTime,
                endTime: booking.endTime,
                purpose: booking.purpose,
                bookedBy: booking.user.name,
            })),
        };
    }
}

export const roomService = new RoomService();
