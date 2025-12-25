import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import { UserRole } from '@prisma/client';

describe('Auth Integration Tests', () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });

    afterEach(async () => {
        await prisma.user.deleteMany();
    });

    describe('POST /api/v1/auth/register', () => {
        const validUser = {
            email: 'test@example.com',
            password: 'Password123!',
            name: 'Test User',
        };

        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(validUser);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toHaveProperty('id');
            expect(response.body.data.user.email).toBe(validUser.email);
            expect(response.body.data.user.role).toBe(UserRole.USER);
            expect(response.body.data).toHaveProperty('token');
        });

        it('should not register a user with existing email', async () => {
            // First registration
            await request(app).post('/api/v1/auth/register').send(validUser);

            // Second registration with same email
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(validUser);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Email sudah terdaftar');
        });

        it('should validate input fields', async () => {
            const invalidUser = {
                email: 'invalid-email',
                password: 'weak',
                name: '',
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(invalidUser);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body).toHaveProperty('errors');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        const userCredentials = {
            email: 'login@example.com',
            password: 'Password123!',
            name: 'Login User',
        };

        beforeEach(async () => {
            await request(app).post('/api/v1/auth/register').send(userCredentials);
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: userCredentials.email,
                    password: userCredentials.password,
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.user.email).toBe(userCredentials.email);
        });

        it('should reject invalid password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: userCredentials.email,
                    password: 'WrongPassword123!',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should reject non-existent user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'Password123!',
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
