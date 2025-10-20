/**
 * Test environment setup
 * Sets environment variables needed for tests
 */

// Set test environment variables
process.env.WGER_API_URL = 'https://wger.de/api/v2';
process.env.WGER_API_KEY = 'test-api-key';
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests
process.env.HTTP_TIMEOUT = '10000';
process.env.CACHE_TTL_STATIC = '86400';
process.env.CACHE_TTL_EXERCISE = '3600';
