/**
 * Unit tests for authentication module
 * Tests critical auth behaviors including token request, caching, and refresh
 */

import axios from 'axios';
import { AuthenticationError } from '../../../src/utils/errors';
import { mockAuthResponses } from '../../fixtures/api-responses';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock config to use username/password instead of API key
jest.mock('../../../src/config', () => ({
  config: {
    wgerApiKey: undefined,
    wgerUsername: 'testuser',
    wgerPassword: 'testpass',
    wgerApiUrl: 'https://wger.de/api/v2',
    httpTimeout: 10000,
    logLevel: 'error' as const,
    cacheTtlStatic: 86400,
    cacheTtlExercise: 3600,
  },
}));

// Import AuthManager after mocks are set up
import { AuthManager } from '../../../src/client/auth';

describe('AuthManager', () => {
  let authManager: AuthManager;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      post: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Create new auth manager
    authManager = new AuthManager();
  });

  afterEach(() => {
    // Clear any cached tokens
    authManager.clearToken();
  });

  describe('token request', () => {
    it('should request and cache token successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockAuthResponses.success,
      });

      const token = await authManager.getToken();

      expect(token).toBe(mockAuthResponses.success.access);
      expect(mockAxiosInstance.post).toHaveBeenCalled();
    });

    it('should throw AuthenticationError on 401', async () => {
      const error = {
        response: {
          status: 401,
          data: { detail: 'Invalid credentials' },
        },
      };
      mockAxiosInstance.post.mockRejectedValue(error);
      mockedAxios.isAxiosError.mockReturnValue(true);

      await expect(authManager.getToken()).rejects.toThrow(AuthenticationError);
    });
  });

  describe('token caching', () => {
    it('should return cached token on subsequent calls', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockAuthResponses.success,
      });

      // First call
      const token1 = await authManager.getToken();
      // Second call
      const token2 = await authManager.getToken();

      expect(token1).toBe(token2);
      // Should only make one API call
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it('should clear cached token when requested', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockAuthResponses.success,
      });

      await authManager.getToken();
      authManager.clearToken();

      // Should request new token
      await authManager.getToken();

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('token refresh', () => {
    it('should refresh expired token after clearing', async () => {
      // Mock initial token request
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockAuthResponses.success,
      });

      await authManager.getToken();

      // Mock the token as expired by clearing it
      authManager.clearToken();

      // Mock new token request
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: mockAuthResponses.success,
      });

      const newToken = await authManager.getToken();

      expect(newToken).toBe(mockAuthResponses.success.access);
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('hasCredentials', () => {
    it('should return true when credentials are configured', () => {
      const manager = new AuthManager();

      // In test environment, credentials are set in jest-setup.ts
      expect(manager.hasCredentials()).toBe(true);
    });
  });

  describe('handleAuthError', () => {
    it('should clear token and retry on auth error', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockAuthResponses.success,
      });

      const retryFn = jest.fn().mockResolvedValue('success');

      const result = await authManager.handleAuthError(retryFn);

      expect(result).toBe('success');
      expect(retryFn).toHaveBeenCalled();
    });
  });
});
