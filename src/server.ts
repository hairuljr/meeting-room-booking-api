import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

const startServer = async (): Promise<void> => {
    try {
        // Connect to database
        await connectDatabase();

        // Start server
        const server = app.listen(env.port, () => {
            console.log('Server started successfully!');
            console.log(`Environment: ${env.nodeEnv}`);
            console.log(`Server running on: http://localhost:${env.port}`);
            console.log(`API Documentation: http://localhost:${env.port}/api-docs`);
            console.log(`API Base URL: http://localhost:${env.port}${env.apiPrefix}`);
            console.log('\nReady to accept requests!\n');
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal: string): Promise<void> => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                console.log('HTTP server closed');
                await disconnectDatabase();
                console.log('Graceful shutdown completed');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught errors
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            gracefulShutdown('UNHANDLED_REJECTION');
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();
