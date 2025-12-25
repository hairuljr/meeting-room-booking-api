import prisma from '../config/database';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors.util';
import { CreateBookingInput } from '../validators/booking.validator';

export class BookingService {
    async createBooking(userId: string, data: CreateBookingInput) {
        const { roomId, startTime, endTime, purpose } = data;

        // Parse dates
        const start = new Date(startTime);
        const end = new Date(endTime);

        // Validate dates
        this.validateBookingTimes(start, end);

        // Check if room exists and is active
        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room || !room.isActive) {
            throw new NotFoundError('Ruangan tidak ditemukan');
        }

        // Check for conflicts
        await this.checkConflicts(roomId, start, end);

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                userId,
                roomId,
                startTime: start,
                endTime: end,
                purpose,
            },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                    },
                },
            },
        });

        return booking;
    }

    async getUserBookings(userId: string) {
        const bookings = await prisma.booking.findMany({
            where: {
                userId,
                status: { not: 'CANCELLED' },
            },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        capacity: true,
                    },
                },
            },
            orderBy: { startTime: 'desc' },
        });

        return bookings;
    }

    /**
     * Validate booking times
     * - startTime must be before endTime
     * - booking must be in the future
     * - minimum booking duration is 30 minutes
     */
    private validateBookingTimes(startTime: Date, endTime: Date): void {
        const now = new Date();
        const minimumDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

        if (startTime >= endTime) {
            throw new ValidationError('Waktu mulai harus sebelum waktu selesai');
        }

        if (startTime < now) {
            throw new ValidationError('Tidak dapat melakukan booking di masa lalu');
        }

        const duration = endTime.getTime() - startTime.getTime();
        if (duration < minimumDuration) {
            throw new ValidationError('Durasi booking minimal 30 menit');
        }
    }

    /**
     * Check for booking conflicts
     * Two bookings conflict if:
     * (newStart < existingEnd) AND (newEnd > existingStart)
     * 
     * This covers all overlap scenarios:
     * 1. New booking starts during existing booking
     * 2. New booking ends during existing booking
     * 3. New booking completely contains existing booking
     * 4. Existing booking completely contains new booking
     */
    private async checkConflicts(
        roomId: string,
        startTime: Date,
        endTime: Date,
        excludeBookingId?: string,
    ): Promise<void> {
        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                roomId,
                status: { not: 'CANCELLED' },
                ...(excludeBookingId && { id: { not: excludeBookingId } }),
                OR: [
                    // Case 1: New booking starts during existing booking
                    {
                        AND: [
                            { startTime: { lte: startTime } },
                            { endTime: { gt: startTime } },
                        ],
                    },
                    // Case 2: New booking ends during existing booking
                    {
                        AND: [
                            { startTime: { lt: endTime } },
                            { endTime: { gte: endTime } },
                        ],
                    },
                    // Case 3: New booking completely contains existing booking
                    {
                        AND: [
                            { startTime: { gte: startTime } },
                            { endTime: { lte: endTime } },
                        ],
                    },
                ],
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (conflictingBooking) {
            throw new ConflictError('Ruangan sudah dibooking pada waktu tersebut');
        }
    }
}

export const bookingService = new BookingService();
