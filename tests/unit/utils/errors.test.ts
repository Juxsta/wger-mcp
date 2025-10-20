/**
 * Unit tests for error classes and utilities
 * Tests error creation, types, and message transformation
 */

import {
  ApiError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  createErrorFromStatus,
  isRetryableError,
  getUserFriendlyMessage,
} from '../../../src/utils/errors';

describe('Error Classes', () => {
  describe('ApiError', () => {
    it('should create error with message and status code', () => {
      const error = new ApiError('Test error', 500, { extra: 'data' });

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ extra: 'data' });
      expect(error.name).toBe('ApiError');
    });
  });

  describe('AuthenticationError', () => {
    it('should create 401 error', () => {
      const error = new AuthenticationError('Auth failed');

      expect(error.message).toBe('Auth failed');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 error', () => {
      const error = new NotFoundError('Resource not found');

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('RateLimitError', () => {
    it('should create 429 error with default message', () => {
      const error = new RateLimitError();

      expect(error.statusCode).toBe(429);
      expect(error.message).toContain('Rate limit');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });

      expect(error.message).toBe('Invalid input');
      expect(error.details).toEqual({ field: 'email' });
      expect(error.name).toBe('ValidationError');
    });
  });
});

describe('createErrorFromStatus', () => {
  it('should create AuthenticationError for 401', () => {
    const error = createErrorFromStatus(401, 'Unauthorized');

    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.statusCode).toBe(401);
  });

  it('should create NotFoundError for 404', () => {
    const error = createErrorFromStatus(404, 'Not found');

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.statusCode).toBe(404);
  });

  it('should create RateLimitError for 429', () => {
    const error = createErrorFromStatus(429, 'Too many requests');

    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.statusCode).toBe(429);
  });

  it('should create ValidationError for 400', () => {
    const error = createErrorFromStatus(400, 'Bad request');

    expect(error).toBeInstanceOf(ValidationError);
  });

  it('should create generic ApiError for other status codes', () => {
    const error = createErrorFromStatus(500, 'Server error');

    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(500);
  });
});

describe('isRetryableError', () => {
  it('should return true for 5xx errors', () => {
    const error = new ApiError('Server error', 500);

    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for 4xx errors', () => {
    const error = new NotFoundError('Not found');

    expect(isRetryableError(error)).toBe(false);
  });

  it('should return true for network timeout errors', () => {
    const error = new Error('ETIMEDOUT');

    expect(isRetryableError(error)).toBe(true);
  });

  it('should return true for connection reset errors', () => {
    const error = new Error('ECONNRESET');

    expect(isRetryableError(error)).toBe(true);
  });

  it('should return false for other errors', () => {
    const error = new Error('Some other error');

    expect(isRetryableError(error)).toBe(false);
  });
});

describe('getUserFriendlyMessage', () => {
  it('should return friendly message for AuthenticationError', () => {
    const error = new AuthenticationError();
    const message = getUserFriendlyMessage(error);

    expect(message).toContain('credentials');
  });

  it('should return error message for NotFoundError', () => {
    const error = new NotFoundError('Exercise not found');
    const message = getUserFriendlyMessage(error);

    expect(message).toBe('Exercise not found');
  });

  it('should return friendly message for RateLimitError', () => {
    const error = new RateLimitError();
    const message = getUserFriendlyMessage(error);

    expect(message).toContain('Too many requests');
  });

  it('should return friendly message for ValidationError', () => {
    const error = new ValidationError('Invalid email');
    const message = getUserFriendlyMessage(error);

    expect(message).toContain('Invalid input');
  });

  it('should return friendly message for 5xx ApiError', () => {
    const error = new ApiError('Server error', 503);
    const message = getUserFriendlyMessage(error);

    expect(message).toContain('temporarily unavailable');
  });

  it('should return default message for unknown errors', () => {
    const message = getUserFriendlyMessage({});

    expect(message).toBe('An unexpected error occurred.');
  });
});
