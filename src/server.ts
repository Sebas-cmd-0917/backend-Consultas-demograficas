import { app, prisma } from './app';
import { env } from './config/env.config';
import { logger } from './config/logger.config';

// Start the Express HTTP server
const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
  logger.info(`Health check available at http://localhost:${env.PORT}/health`);
  if (!env.INGEST_API_KEY) {
    logger.warn('⚠️ INGEST_API_KEY no configurada: el endpoint POST está abierto.');
  }
});

/**
 * Handles graceful shutdown by releasing resources and terminating the process safely.
 */
const gracefulShutdown = async (signal: string) => {
  logger.warn(`⚠️ Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server has been shut down.');

    try {
      await prisma.$disconnect();
      logger.info('Database connections closed successfully.');
      process.exit(0);
    } catch (error) {
      logger.error('Error disconnecting database client:', error);
      process.exit(1);
    }
  });

  // Fallback timeout to force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('❌ Forced shutdown triggered: operations timed out.');
    process.exit(1);
  }, 10000);
};

// Handle process termination events
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
