import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB, disconnectDB } from './config/db';
import { logger } from './config/logger';
import { initLeadReminderCron } from './cron/leadReminder.cron';

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to Database
    logger.info('Initializing database connection...');
    await connectDB();

    // 2. Initialize Background Cron Tasks
    initLeadReminderCron();

    // 3. Start Express HTTP Server
    const server = app.listen(PORT, () => {
      logger.info(`EstateFlow API is running at http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });

    // Graceful Shutdown Function
    const handleShutdown = async (signal: string) => {
      logger.info(`${signal} received. Initiating graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        logger.info('Graceful shutdown completed. Exiting process.');
        process.exit(0);
      });

      // Force shutdown if connections do not close in time
      setTimeout(() => {
        logger.error('Forceful shutdown triggered after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception thrown:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Fatal error encountered during server bootstrap:', error);
    process.exit(1);
  }
};

startServer();
