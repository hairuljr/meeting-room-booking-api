import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface EnvConfig {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    apiPrefix: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const env: EnvConfig = {
    port: parseInt(getEnvVariable('PORT', '3000'), 10),
    nodeEnv: getEnvVariable('NODE_ENV', 'development'),
    databaseUrl: getEnvVariable('DATABASE_URL'),
    jwtSecret: getEnvVariable('JWT_SECRET'),
    jwtExpiresIn: getEnvVariable('JWT_EXPIRES_IN', '24h'),
    apiPrefix: getEnvVariable('API_PREFIX', '/api/v1'),
};
