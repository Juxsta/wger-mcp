#!/usr/bin/env node

/**
 * Entry point for wger MCP server
 * Initializes the server and handles startup errors
 */

import { createServer } from './server';
import { logger } from './utils/logger';
import { config } from './config';

/**
 * Main server startup function
 */
async function main(): Promise<void> {
  try {
    logger.info('Initializing wger MCP server');
    logger.debug('Configuration loaded', {
      apiUrl: config.wgerApiUrl,
      logLevel: config.logLevel,
      hasApiKey: Boolean(config.wgerApiKey),
      hasUsername: Boolean(config.wgerUsername),
    });

    // Create and start the server
    const server = createServer();
    await server.start();

    // Handle graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      try {
        await server.stop();
        process.exit(0);
      } catch (error) {
        const errorObj = error instanceof Error ? error : undefined;
        logger.error('Error during shutdown', errorObj);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    // Keep the process running
    // The MCP server listens on stdio and will handle requests
  } catch (error) {
    const errorObj = error instanceof Error ? error : undefined;
    logger.error('Failed to start wger MCP server', errorObj);

    // Provide helpful error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        // eslint-disable-next-line no-console
        console.error('\nError: Authentication credentials not configured');
        // eslint-disable-next-line no-console
        console.error('Please set one of the following:');
        // eslint-disable-next-line no-console
        console.error('  - WGER_API_KEY environment variable');
        // eslint-disable-next-line no-console
        console.error('  - WGER_USERNAME and WGER_PASSWORD environment variables\n');
      } else if (error.message.includes('Configuration validation failed')) {
        // eslint-disable-next-line no-console
        console.error('\nError: Invalid configuration');
        // eslint-disable-next-line no-console
        console.error(error.message);
        // eslint-disable-next-line no-console
        console.error('\nPlease check your environment variables.\n');
      } else {
        // eslint-disable-next-line no-console
        console.error('\nFatal error:', error.message);
        if (error.stack) {
          logger.debug('Stack trace:', { stack: error.stack });
        }
      }
    }

    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const errorObj = reason instanceof Error ? reason : undefined;
  logger.error('Unhandled promise rejection', errorObj, {
    promise: String(promise),
  });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

// Start the server
main();
