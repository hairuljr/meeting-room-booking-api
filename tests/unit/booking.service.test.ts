import { bookingService } from '../../src/services/booking.service';
import prisma from '../../src/config/database';
import { ConflictError, ValidationError } from '../../src/utils/errors.util';

// Mock Prisma
jest.mock('../../src/config/database', () => ({
    __esModule: true,
    default: {
        room: {
            findUnique: jest.fn(),
        },
        booking: {
            findFirst: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('BookingService Unit Tests', () => {
    const mockUserId = 'user-123';
    const mockRoomId = 'room-123';
    const validBookingData = {
        roomId: mockRoomId,
        startTime: '2025-12-26T10:00:00Z',
        endTime: '2025-12-26T12:00:00Z',
        purpose: 'Unit Test',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createBooking', () => {
        it('should throw ValidationError if start time is after end time', async () => {
            const invalidData = {
                ...validBookingData,
                startTime: '2025-12-26T13:00:00Z',
                endTime: '2025-12-26T12:00:00Z',
            };

            await expect(bookingService.createBooking(mockUserId, invalidData))
                .rejects
                .toThrow(ValidationError);
        });

        it('should throw ValidationError if booking is in the past', async () => {
            const pastData = {
                ...validBookingData,
                startTime: '2020-01-01T10:00:00Z',
                endTime: '2020-01-01T12:00:00Z',
            };

            await expect(bookingService.createBooking(mockUserId, pastData))
                .rejects
                .toThrow(ValidationError);
        });

        it('should throw ConflictError if conflict detected', async () => {
            // Mock room exists
            (prisma.room.findUnique as jest.Mock).mockResolvedValue({ id: mockRoomId, isActive: true });

            // Mock conflict found
            (prisma.booking.findFirst as jest.Mock).mockResolvedValue({ id: 'existing-booking' });

            await expect(bookingService.createBooking(mockUserId, validBookingData))
                .rejects
                .toThrow(ConflictError);
        });
    });
});
