import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import { UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

const generateToken = (userId: string) => {
    return jwt.sign({ userId, email: 'test@example.com', role: 'USER' }, env.jwtSecret, {
        expiresIn: '1h',
    });
};

describe('Bookings Integration Tests', () => {
    let userToken: string;
    let roomId: string;
    let userId: string;

    beforeAll(async () => {
        await prisma.$connect();

        // Create user
        const user = await prisma.user.create({
            data: {
                email: 'booking-test@example.com',
                password: 'hash',
                name: 'Booking Test User',
                role: UserRole.USER,
            },
        });
        userId = user.id;
        userToken = generateToken(user.id);

        // Create room
        const room = await prisma.room.create({
            data: {
                name: 'Booking Test Room',
                capacity: 10,
                location: 'Test Floor',
            },
        });
        roomId = room.id;
    });

    afterAll(async () => {
        await prisma.booking.deleteMany();
        await prisma.room.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    afterEach(async () => {
        await prisma.booking.deleteMany();
    });

    describe('POST /api/v1/bookings', () => {
        // Helper to get tomorrow's date at specific hour
        const getTomorrowAt = (hour: number) => {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            date.setHours(hour, 0, 0, 0);
            return date.toISOString();
        };

        it('should create a booking successfully', async () => {
            const bookingData = {
                roomId,
                startTime: getTomorrowAt(10), // 10:00
                endTime: getTomorrowAt(12),   // 12:00
                purpose: 'Team Sync',
            };

            const response = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send(bookingData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.roomId).toBe(roomId);
        });

        it('should detect direct conflict (exact overlap)', async () => {
            // Create initial booking
            await prisma.booking.create({
                data: {
                    userId,
                    roomId,
                    startTime: getTomorrowAt(10),
                    endTime: getTomorrowAt(12),
                },
            });

            // Try to book same slot
            const response = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    roomId,
                    startTime: getTomorrowAt(10),
                    endTime: getTomorrowAt(12),
                });

            expect(response.status).toBe(409);
            expect(response.body.message).toContain('Ruangan sudah dibooking');
        });

        it('should detect partial conflict (new starts inside existing)', async () => {
            // Existing: 10:00 - 12:00
            await prisma.booking.create({
                data: {
                    userId,
                    roomId,
                    startTime: getTomorrowAt(10),
                    endTime: getTomorrowAt(12),
                },
            });

            // New: 11:00 - 13:00
            const response = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    roomId,
                    startTime: getTomorrowAt(11),
                    endTime: getTomorrowAt(13),
                });

            expect(response.status).toBe(409);
        });

        it('should detect partial conflict (new ends inside existing)', async () => {
            // Existing: 10:00 - 12:00
            await prisma.booking.create({
                data: {
                    userId,
                    roomId,
                    startTime: getTomorrowAt(10),
                    endTime: getTomorrowAt(12),
                },
            });

            // New: 09:00 - 11:00
            const response = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    roomId,
                    startTime: getTomorrowAt(9),
                    endTime: getTomorrowAt(11),
                });

            expect(response.status).toBe(409);
        });

        it('should detect containment conflict (new contains existing)', async () => {
            // Existing: 10:00 - 12:00
            await prisma.booking.create({
                data: {
                    userId,
                    roomId,
                    startTime: getTomorrowAt(10),
                    endTime: getTomorrowAt(12),
                },
            });

            // New: 09:00 - 13:00
            const response = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    roomId,
                    startTime: getTomorrowAt(9),
                    endTime: getTomorrowAt(13),
                });

            expect(response.status).toBe(409);
        });

        it('should validate logical constraints (start < end)', async () => {
            const response = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    roomId,
                    startTime: getTomorrowAt(12),
                    endTime: getTomorrowAt(10), // Invalid: End before Start
                });

            expect(response.status).toBe(400);
        });

        it('should validate minimum duration (30 mins)', async () => {
            const start = new Date(getTomorrowAt(10));
            const end = new Date(start.getTime() + 15 * 60000); // 15 mins later

            const response = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    roomId,
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Durasi booking minimal');
        });
    });

    describe('GET /api/v1/bookings/my', () => {
        it('should return user bookings', async () => {
            await prisma.booking.create({
                data: {
                    userId,
                    roomId,
                    startTime: new Date(Date.now() + 86400000), // Tomorrow
                    endTime: new Date(Date.now() + 90000000),
                    purpose: 'My Booking',
                },
            });

            const response = await request(app)
                .get('/api/v1/bookings/my')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
        });
    });
});
