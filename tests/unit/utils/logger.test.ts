/**
 * Unit tests for logger module
 * Tests critical logging behaviors including level filtering and formatting
 */

import { Logger } from '../../../src/utils/logger';

// Mock console methods
const mockConsole = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    jest.clearAllMocks();

    // Replace console methods with mocks
    global.console.debug = mockConsole.debug;
    global.console.info = mockConsole.info;
    global.console.warn = mockConsole.warn;
    global.console.error = mockConsole.error;

    logger = new Logger('info');
  });

  describe('log level filtering', () => {
    it('should log info messages when level is info', () => {
      logger.info('Test message');

      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('Test message'));
    });

    it('should not log debug messages when level is info', () => {
      logger.debug('Debug message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should log warn and error when level is warn', () => {
      logger.setLevel('warn');

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warning');
      logger.error('Error');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('should log all messages when level is debug', () => {
      logger.setLevel('debug');

      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warning');
      logger.error('Error');

      expect(mockConsole.debug).toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe('log formatting', () => {
    it('should format log with timestamp and level', () => {
      logger.info('Test message');

      const logCall = mockConsole.info.mock.calls[0][0];
      expect(logCall).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO timestamp
      expect(logCall).toContain('INFO');
      expect(logCall).toContain('Test message');
    });

    it('should include metadata in log output', () => {
      logger.info('Test message', { userId: 123, action: 'login' });

      const logCall = mockConsole.info.mock.calls[0][0];
      expect(logCall).toContain('userId');
      expect(logCall).toContain('123');
      expect(logCall).toContain('action');
      expect(logCall).toContain('login');
    });

    it('should format error logs with error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      const logCall = mockConsole.error.mock.calls[0][0];
      expect(logCall).toContain('Error occurred');
      expect(logCall).toContain('Test error');
      expect(logCall).toContain('Error');
    });
  });

  describe('getLevel and setLevel', () => {
    it('should get and set log level', () => {
      expect(logger.getLevel()).toBe('info');

      logger.setLevel('debug');
      expect(logger.getLevel()).toBe('debug');

      logger.setLevel('error');
      expect(logger.getLevel()).toBe('error');
    });
  });
});
