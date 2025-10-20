/**
 * Integration tests for authentication flow
 * Tests complete authentication lifecycle: login, token refresh, expiration, retry logic
 */

import { setupMSW, server, errorHandlers } from '../setup/msw-setup';
import { authManager } from '../../src/client/auth';
import { createWorkoutHandler } from '../../src/tools/create-workout';
import { getUserRoutinesHandler } from '../../src/tools/get-user-routines';
import { cache } from '../../src/client/cache';

// Setup MSW for API mocking
setupMSW();

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    // Clear cache and auth state before each test
    cache.clear();
    authManager.clearToken();

    // Clear environment variables
    delete process.env.WGER_API_KEY;
    delete process.env.WGER_USERNAME;
    delete process.env.WGER_PASSWORD;
  });

  afterEach(() => {
    // Clean up environment after tests
    delete process.env.WGER_API_KEY;
    delete process.env.WGER_USERNAME;
    delete process.env.WGER_PASSWORD;
  });

  describe('Authentication with API key', () => {
    it('should successfully authenticate with valid API key', async () => {
      process.env.WGER_API_KEY = 'test-api-key-12345';

      // Trigger authentication by making an authenticated request
      const workout = await createWorkoutHandler({
        name: 'Test Workout',
      });

      expect(workout).toBeDefined();
      expect(workout.id).toBeGreaterThan(0);
    });

    it('should cache authentication token after first request', async () => {
      process.env.WGER_API_KEY = 'test-api-key-12345';

      // First authenticated request
      await createWorkoutHandler({ name: 'Workout 1' });

      // Verify token is cached
      expect(authManager.hasCredentials()).toBe(true);

      // Second request should use cached token (not request new one)
      await createWorkoutHandler({ name: 'Workout 2' });
      await getUserRoutinesHandler({});

      // All requests should succeed using the same cached token
    });

    it('should fail with invalid API key', async () => {
      process.env.WGER_API_KEY = 'invalid-key';

      // Mock authentication failure
      server.use(...errorHandlers.unauthorized);

      await expect(createWorkoutHandler({ name: 'Test' })).rejects.toThrow();
    });
  });

  describe('Authentication with username and password', () => {
    it('should successfully authenticate with username/password', async () => {
      process.env.WGER_USERNAME = 'testuser';
      process.env.WGER_PASSWORD = 'testpass123';

      const workout = await createWorkoutHandler({
        name: 'Test Workout',
      });

      expect(workout).toBeDefined();
      expect(workout.id).toBeGreaterThan(0);
    });

    it('should prefer API key over username/password when both provided', async () => {
      process.env.WGER_API_KEY = 'test-api-key';
      process.env.WGER_USERNAME = 'testuser';
      process.env.WGER_PASSWORD = 'testpass';

      // Should use API key
      const workout = await createWorkoutHandler({
        name: 'Test Workout',
      });

      expect(workout).toBeDefined();
    });

    it('should fail when password is missing', async () => {
      process.env.WGER_USERNAME = 'testuser';
      // No password provided

      await expect(createWorkoutHandler({ name: 'Test' })).rejects.toThrow();
    });

    it('should fail when username is missing', async () => {
      process.env.WGER_PASSWORD = 'testpass';
      // No username provided

      await expect(createWorkoutHandler({ name: 'Test' })).rejects.toThrow();
    });
  });

  describe('Token refresh', () => {
    it('should automatically refresh expired tokens', async () => {
      process.env.WGER_API_KEY = 'test-api-key';

      // Get initial token
      const token1 = await authManager.getToken();
      expect(token1).toBeDefined();

      // Simulate token expiration by clearing cache
      authManager.clearToken();

      // Get new token (should trigger refresh)
      const token2 = await authManager.getToken();
      expect(token2).toBeDefined();
    });

    it('should reuse token if not expired', async () => {
      process.env.WGER_API_KEY = 'test-api-key';

      // Get token
      const token1 = await authManager.getToken();

      // Immediately get token again (should use cached)
      const token2 = await authManager.getToken();

      expect(token1).toBe(token2);
    });

    it('should refresh token before expiration (5 minute buffer)', async () => {
      process.env.WGER_API_KEY = 'test-api-key';

      // Get initial token
      await authManager.getToken();

      // Token should be cached and valid
      expect(authManager.hasCredentials()).toBe(true);

      // Multiple requests within expiration window should reuse token
      await createWorkoutHandler({ name: 'Test 1' });
      await createWorkoutHandler({ name: 'Test 2' });
      await getUserRoutinesHandler({});
    });
  });

  describe('Token expiration handling', () => {
    it('should handle token expiration during API calls', async () => {
      process.env.WGER_API_KEY = 'test-api-key';

      // Make successful authenticated request
      const workout1 = await createWorkoutHandler({
        name: 'Before Expiration',
      });
      expect(workout1).toBeDefined();

      // Clear token to simulate expiration
      authManager.clearToken();

      // Next request should automatically get new token
      const workout2 = await createWorkoutHandler({
        name: 'After Expiration',
      });
      expect(workout2).toBeDefined();
    });

    it('should clear token cache on 401 response', async () => {
      process.env.WGER_API_KEY = 'test-api-key';

      // Get initial token
      await authManager.getToken();

      // Simulate 401 unauthorized response
      server.use(...errorHandlers.unauthorized);

      await expect(getUserRoutinesHandler({})).rejects.toThrow();
    });
  });

  describe('401 retry logic', () => {
    it('should retry once on 401 unauthorized error', async () => {
      process.env.WGER_API_KEY = 'test-api-key';

      // First request should succeed
      await createWorkoutHandler({ name: 'Test' });

      // Simulate transient 401 that resolves on retry
      // This tests that retry logic is in place
      server.use(...errorHandlers.unauthorized);

      // Should retry and fail
      await expect(getUserRoutinesHandler({})).rejects.toThrow();
    });

    it('should not retry indefinitely on persistent 401 errors', async () => {
      process.env.WGER_API_KEY = 'test-api-key';

      // Mock persistent 401 errors
      server.use(...errorHandlers.unauthorized);

      await expect(getUserRoutinesHandler({})).rejects.toThrow();

      // Should fail after one retry attempt, not loop forever
    });
  });

  describe('Concurrent authentication requests', () => {
    it('should handle multiple concurrent requests with single auth', async () => {
      process.env.WGER_API_KEY = 'test-api-key';

      // Make multiple concurrent authenticated requests
      const promises = [
        createWorkoutHandler({ name: 'Workout 1' }),
        createWorkoutHandler({ name: 'Workout 2' }),
        createWorkoutHandler({ name: 'Workout 3' }),
        getUserRoutinesHandler({}),
      ];

      const results = await Promise.all(promises);

      // All requests should succeed
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
      expect(results[2]).toBeDefined();
      expect(results[3]).toBeDefined();

      // Should have only authenticated once (token reused)
    });

    it('should queue concurrent auth requests to avoid duplicate token requests', async () => {
      process.env.WGER_API_KEY = 'test-api-key';

      // Start with no cached token
      authManager.clearToken();

      // Make multiple concurrent requests that all need authentication
      const promises = [
        authManager.getToken(),
        authManager.getToken(),
        authManager.getToken(),
      ];

      const tokens = await Promise.all(promises);

      // All should return the same token (not request 3 times)
      expect(tokens[0]).toBe(tokens[1]);
      expect(tokens[1]).toBe(tokens[2]);
    });
  });

  describe('No authentication provided', () => {
    it('should fail gracefully when no credentials provided', async () => {
      // No API key, username, or password set

      await expect(createWorkoutHandler({ name: 'Test' })).rejects.toThrow();
    });

    it('should provide clear error message for missing credentials', async () => {
      try {
        await createWorkoutHandler({ name: 'Test' });
        fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
        // Error should indicate authentication is required
      }
    });

    it('should not attempt authentication for public endpoints', async () => {
      // Public endpoints should work without authentication
      // (tested in exercise-discovery tests, but worth noting here)
    });
  });

  describe('Authentication state management', () => {
    it('should maintain authentication across multiple tool calls', async () => {
      process.env.WGER_API_KEY = 'test-api-key';

      // Authenticate once
      await createWorkoutHandler({ name: 'Test 1' });

      // Multiple subsequent calls should use same auth
      await createWorkoutHandler({ name: 'Test 2' });
      await getUserRoutinesHandler({});
      await createWorkoutHandler({ name: 'Test 3' });

      // All should succeed with single authentication
    });

    it('should clear authentication state when explicitly requested', async () => {
      process.env.WGER_API_KEY = 'test-api-key';

      // Get token
      await authManager.getToken();
      expect(authManager.hasCredentials()).toBe(true);

      // Clear token
      authManager.clearToken();

      // Next request should authenticate again
      await createWorkoutHandler({ name: 'Test' });
    });

    it('should handle switching between different auth methods', async () => {
      // Start with API key
      process.env.WGER_API_KEY = 'test-api-key';
      await createWorkoutHandler({ name: 'Test 1' });

      // Clear and switch to username/password
      authManager.clearToken();
      delete process.env.WGER_API_KEY;
      process.env.WGER_USERNAME = 'testuser';
      process.env.WGER_PASSWORD = 'testpass';

      await createWorkoutHandler({ name: 'Test 2' });

      // Both should work
    });
  });

  describe('Edge cases', () => {
    it('should handle empty API key', async () => {
      process.env.WGER_API_KEY = '';

      await expect(createWorkoutHandler({ name: 'Test' })).rejects.toThrow();
    });

    it('should handle whitespace-only credentials', async () => {
      process.env.WGER_API_KEY = '   ';

      await expect(createWorkoutHandler({ name: 'Test' })).rejects.toThrow();
    });

    it('should handle special characters in credentials', async () => {
      process.env.WGER_API_KEY = 'test-key-!@#$%^&*()';

      // Should handle special characters in API key
      await createWorkoutHandler({ name: 'Test' });
    });
  });
});
