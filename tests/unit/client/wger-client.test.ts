/**
 * Unit tests for HTTP client
 * Tests critical client behaviors including requests, auth injection, and retry logic
 */

import axios from 'axios';
import { ApiError, NotFoundError, RateLimitError } from '../../../src/utils/errors';
import { mockPaginatedExercises } from '../../fixtures/api-responses';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock auth manager
const mockAuthManager = {
  hasCredentials: jest.fn().mockReturnValue(true),
  getToken: jest.fn().mockResolvedValue('mock-token'),
  clearToken: jest.fn(),
};

jest.mock('../../../src/client/auth', () => ({
  authManager: mockAuthManager,
}));

// Import WgerClient after mocks are set up
import { WgerClient } from '../../../src/client/wger-client';

describe('WgerClient', () => {
  let client: WgerClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock axios instance with interceptors
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
        },
        response: {
          use: jest.fn(),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    mockedAxios.isAxiosError.mockReturnValue(true);

    client = new WgerClient();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockPaginatedExercises,
      });

      const result = await client.get('/exercise/');

      expect(result).toEqual(mockPaginatedExercises);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/exercise/', undefined);
    });

    it('should pass query parameters', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockPaginatedExercises,
      });

      const params = { limit: 10, offset: 0 };
      await client.get('/exercise/', { params });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/exercise/', { params });
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const requestData = { name: 'Test Workout' };
      const responseData = { id: 1, name: 'Test Workout' };

      mockAxiosInstance.post.mockResolvedValue({
        data: responseData,
      });

      const result = await client.post('/workout/', requestData);

      expect(result).toEqual(responseData);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/workout/', requestData, undefined);
    });
  });

  describe('error transformation', () => {
    it('should transform 404 error to NotFoundError', async () => {
      const error = {
        response: {
          status: 404,
          data: { detail: 'Not found' },
        },
        config: { url: '/exercise/999/' },
      };

      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.get('/exercise/999/')).rejects.toThrow(NotFoundError);
    });

    it('should transform 429 error to RateLimitError', async () => {
      const error = {
        response: {
          status: 429,
          data: { detail: 'Rate limit exceeded' },
        },
        config: { url: '/exercise/' },
      };

      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.get('/exercise/')).rejects.toThrow(RateLimitError);
    });

    it('should transform 500 error to ApiError', async () => {
      const error = {
        response: {
          status: 500,
          data: { detail: 'Internal server error' },
        },
        config: { url: '/exercise/' },
      };

      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.get('/exercise/')).rejects.toThrow(ApiError);
    });
  });

  describe('retry logic', () => {
    it('should retry on 5xx errors', async () => {
      const error = {
        response: {
          status: 500,
          data: { detail: 'Server error' },
        },
        config: { url: '/exercise/' },
      };

      mockAxiosInstance.get
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ data: mockPaginatedExercises });

      const result = await client.get('/exercise/');

      expect(result).toEqual(mockPaginatedExercises);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 404 errors', async () => {
      const error = {
        response: {
          status: 404,
          data: { detail: 'Not found' },
        },
        config: { url: '/exercise/999/' },
      };

      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(client.get('/exercise/999/')).rejects.toThrow(NotFoundError);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('timeout handling', () => {
    it('should handle timeout errors', async () => {
      const timeoutError = {
        code: 'ETIMEDOUT',
        message: 'timeout of 10000ms exceeded',
      };

      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(client.get('/exercise/')).rejects.toThrow();
    });
  });
});
