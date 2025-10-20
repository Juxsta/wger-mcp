/**
 * Jest setup file
 * Sets up test environment variables and global test configuration
 */

// Set default test environment variables before any imports
process.env.WGER_API_KEY = 'test-api-key-for-jest';
process.env.WGER_API_URL = 'https://wger.de/api/v2';
process.env.LOG_LEVEL = 'error'; // Reduce noise in test output
process.env.HTTP_TIMEOUT = '5000';

// Increase test timeout for integration tests
jest.setTimeout(10000);
