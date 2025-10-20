/**
 * Structured logging system with configurable log levels
 */

import { config } from '../config';

/**
 * Available log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Numeric representation of log levels for comparison
 */
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Log entry metadata
 */
interface LogMetadata {
  [key: string]: unknown;
}

/**
 * Structured logger with support for multiple log levels and metadata
 */
class Logger {
  private currentLevel: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.currentLevel = level;
  }

  /**
   * Set the log level
   * @param level - New log level
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * Check if a log level should be output based on current level
   * @param level - Level to check
   * @returns True if this level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[this.currentLevel];
  }

  /**
   * Format log entry with timestamp, level, and message
   * @param level - Log level
   * @param message - Log message
   * @param metadata - Optional metadata object
   * @returns Formatted log string
   */
  private format(level: LogLevel, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);

    let logLine = `[${timestamp}] ${levelStr} ${message}`;

    if (metadata && Object.keys(metadata).length > 0) {
      logLine += ` ${JSON.stringify(metadata)}`;
    }

    return logLine;
  }

  /**
   * Log a debug message
   * @param message - Message to log
   * @param metadata - Optional metadata
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.debug(this.format('debug', message, metadata));
    }
  }

  /**
   * Log an info message
   * @param message - Message to log
   * @param metadata - Optional metadata
   */
  info(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(this.format('info', message, metadata));
    }
  }

  /**
   * Log a warning message
   * @param message - Message to log
   * @param metadata - Optional metadata
   */
  warn(message: string, metadata?: LogMetadata): void {
    if (this.shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(this.format('warn', message, metadata));
    }
  }

  /**
   * Log an error message
   * @param message - Message to log
   * @param error - Optional error object
   * @param metadata - Optional additional metadata
   */
  error(message: string, error?: Error, metadata?: LogMetadata): void {
    if (this.shouldLog('error')) {
      const errorMetadata: LogMetadata = { ...metadata };

      if (error instanceof Error) {
        errorMetadata.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      } else if (error !== undefined) {
        errorMetadata.error = error;
      }

      // eslint-disable-next-line no-console
      console.error(this.format('error', message, errorMetadata));
    }
  }
}

/**
 * Global logger instance configured from environment
 */
export const logger = new Logger(config.logLevel);

/**
 * Export Logger class for testing purposes
 */
export { Logger };
