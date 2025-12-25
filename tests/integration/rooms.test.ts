import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import { UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

const generateToken = (userId: string, role: string) => {
    return jwt.sign({ userId, email: 'test@example.com', role }, env.jwtSecret, {
        expiresIn: '1h',
    });
};

describe('Rooms Integration Tests', () => {
    let adminToken: string;
    let userToken: string;
    let roomId: string;

    beforeAll(async () => {
        await prisma.$connect();

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email: 'admin-test@example.com',
                password: 'hash',
                name: 'Admin Test',
                role: UserRole.ADMIN,
            },
        });
        adminToken = generateToken(admin.id, UserRole.ADMIN);

        // Create regular user
        const user = await prisma.user.create({
            data: {
                email: 'user-test@example.com',
                password: 'hash',
                name: 'User Test',
                role: UserRole.USER,
            },
        });
        userToken = generateToken(user.id, UserRole.USER);
    });

    afterAll(async () => {
        await prisma.booking.deleteMany();
        await prisma.room.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    describe('POST /api/v1/rooms', () => {
        const newRoom = {
            name: 'Test Room',
            capacity: 10,
            location: 'Test Floor',
            description: 'Test Description',
        };

        it('should allow admin to create a room', async () => {
            const response = await request(app)
                .post('/api/v1/rooms')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newRoom);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(newRoom.name);
            roomId = response.body.data.id;
        });

        it('should forbid non-admin from creating a room', async () => {
            const response = await request(app)
                .post('/api/v1/rooms')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ ...newRoom, name: 'Other Room' });

            expect(response.status).toBe(403);
        });

        it('should require authentication', async () => {
            const response = await request(app)
                .post('/api/v1/rooms')
                .send(newRoom);

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/v1/rooms', () => {
        it('should return list of rooms', async () => {
            const response = await request(app).get('/api/v1/rooms');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/v1/rooms/:id/availability', () => {
        it('should check availability for a date', async () => {
            const today = new Date().toISOString().split('T')[0];
            const response = await request(app)
                .get(`/api/v1/rooms/${roomId}/availability`)
                .query({ date: today });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('isAvailable');
            expect(response.body.data.date).toBe(today);
        });

        it('should return 404 for non-existent room', async () => {
            const today = new Date().toISOString().split('T')[0];
            const response = await request(app)
                .get('/api/v1/rooms/00000000-0000-0000-0000-000000000000/availability')
                .query({ date: today });

            expect(response.status).toBe(404);
        });
    });
});
