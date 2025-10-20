/**
 * Custom error classes for wger MCP server
 * Provides specific error types for different failure scenarios
 */

/**
 * Base error class for all API-related errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Authentication-related errors (401 Unauthorized)
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed', details?: unknown) {
    super(message, 401, details);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Input validation errors (invalid parameters)
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Resource not found errors (404 Not Found)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 404, details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Rate limit exceeded errors (429 Too Many Requests)
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded. Please try again later.', details?: unknown) {
    super(message, 429, details);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Transform HTTP status codes into appropriate error types
 * @param statusCode - HTTP status code
 * @param message - Error message
 * @param details - Additional error details
 * @returns Appropriate error instance
 */
export function createErrorFromStatus(
  statusCode: number,
  message: string,
  details?: unknown
): ApiError {
  switch (statusCode) {
    case 401:
      return new AuthenticationError(message, details);
    case 404:
      return new NotFoundError(message, details);
    case 429:
      return new RateLimitError(message, details);
    case 400:
      return new ValidationError(message, details);
    default:
      return new ApiError(message, statusCode, details);
  }
}

/**
 * Check if an error is retryable (network errors or 5xx server errors)
 * @param error - Error to check
 * @returns True if the error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Retry on 5xx server errors
    return error.statusCode !== undefined && error.statusCode >= 500 && error.statusCode < 600;
  }

  // Retry on network errors (ECONNRESET, ETIMEDOUT, etc.)
  if (error instanceof Error) {
    const networkErrorCodes = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'];
    return networkErrorCodes.some((code) => error.message.includes(code));
  }

  return false;
}

/**
 * Extract user-friendly error message from various error types
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AuthenticationError) {
    return 'Authentication failed. Please check your credentials in the environment variables.';
  }

  if (error instanceof NotFoundError) {
    return error.message;
  }

  if (error instanceof RateLimitError) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (error instanceof ValidationError) {
    return `Invalid input: ${error.message}`;
  }

  if (error instanceof ApiError) {
    if (error.statusCode && error.statusCode >= 500) {
      return 'The wger API is temporarily unavailable. Please try again later.';
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}
