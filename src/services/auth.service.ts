import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';
import { UnauthorizedError, ValidationError } from '../utils/errors.util';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export class AuthService {
    private readonly SALT_ROUNDS = 10;

    async register(data: RegisterInput) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ValidationError('Email sudah terdaftar');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate JWT token
        const token = this.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user,
            token,
        };
    }

    async login(data: LoginInput) {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new UnauthorizedError('Email atau password salah');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedError('Email atau password salah');
        }

        // Generate JWT token
        const token = this.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        };
    }

    private generateToken(payload: { userId: string; email: string; role: string }): string {
        return jwt.sign(payload, env.jwtSecret, {
            expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
        });
    }
}

export const authService = new AuthService();
