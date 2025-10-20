/**
 * HTTP client for wger API with authentication, error handling, and retry logic
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config } from '../config';
import { authManager } from './auth';
import { createErrorFromStatus, isRetryableError, ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Exponential backoff delay calculator
 * @param attempt - Retry attempt number (0-based)
 * @returns Delay in milliseconds
 */
function calculateBackoff(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 5000);
}

/**
 * Sleep for a specified duration
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * HTTP client for wger API
 * Handles authentication, error transformation, and retry logic
 */
export class WgerClient {
  private readonly client: AxiosInstance;
  private readonly maxRetries: number = 1;

  constructor(baseURL: string = config.wgerApiUrl) {
    this.client = axios.create({
      baseURL,
      timeout: config.httpTimeout,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor: Add authentication token
    this.client.interceptors.request.use(
      async (config) => {
        // Check if this is an authenticated endpoint
        // Skip token for public endpoints and auth endpoints
        const isAuthEndpoint = config.url?.includes('/token');
        const isPublicEndpoint =
          config.url?.includes('/exercise') ||
          config.url?.includes('/muscle') ||
          config.url?.includes('/equipment') ||
          config.url?.includes('/exercisecategory');

        const requiresAuth = config.method !== 'get' || !isPublicEndpoint;

        if (requiresAuth && !isAuthEndpoint && authManager.hasCredentials()) {
          try {
            const token = await authManager.getToken();
            config.headers.Authorization = `Token ${token}`;
          } catch (error) {
            const errorObj = error instanceof Error ? error : undefined;
            logger.error('Failed to get authentication token', errorObj);
            throw error;
          }
        }

        logger.debug(`${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
        });

        return config;
      },
      (error: AxiosError) => {
        const errorObj = error instanceof Error ? error : undefined;
        logger.error('Request interceptor error', errorObj);
        return Promise.reject(error);
      }
    );

    // Response interceptor: Transform errors
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`Response ${response.status} from ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const url = error.config?.url;

          logger.warn(`Request failed: ${status} ${url}`, {
            status,
            data: error.response?.data,
          });

          if (status) {
            // Safely extract error message from response data
            const responseData = error.response?.data as
              | { detail?: string; message?: string }
              | undefined;
            const message =
              responseData?.detail || responseData?.message || error.message || 'Request failed';

            throw createErrorFromStatus(status, message, error.response?.data);
          }
        }

        const errorObj = error instanceof Error ? error : undefined;
        logger.error('Request error', errorObj);
        throw error;
      }
    );
  }

  /**
   * Execute a request with retry logic
   * @param requestFn - Function that makes the request
   * @param attempt - Current attempt number
   * @returns Response data
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    attempt: number = 0
  ): Promise<T> {
    try {
      const response = await requestFn();
      return response.data;
    } catch (error) {
      // Check if we should retry
      if (attempt < this.maxRetries && isRetryableError(error)) {
        const delay = calculateBackoff(attempt);
        logger.info(
          `Retrying request after ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`
        );
        await sleep(delay);
        return this.executeWithRetry(requestFn, attempt + 1);
      }

      // Handle 401 errors with re-authentication
      if (error instanceof ApiError && error.statusCode === 401 && attempt === 0) {
        logger.info('Attempting to re-authenticate after 401 error');
        // Clear token and retry - the function doesn't need to be async
        authManager.clearToken();
        return this.executeWithRetry(requestFn, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Make a GET request
   * @param url - Request URL
   * @param config - Optional axios config
   * @returns Response data
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.client.get<T>(url, config));
  }

  /**
   * Make a POST request
   * @param url - Request URL
   * @param data - Request body
   * @param config - Optional axios config
   * @returns Response data
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.client.post<T>(url, data, config));
  }

  /**
   * Make a PUT request
   * @param url - Request URL
   * @param data - Request body
   * @param config - Optional axios config
   * @returns Response data
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.client.put<T>(url, data, config));
  }

  /**
   * Make a DELETE request
   * @param url - Request URL
   * @param config - Optional axios config
   * @returns Response data
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.client.delete<T>(url, config));
  }

  /**
   * Make a PATCH request
   * @param url - Request URL
   * @param data - Request body
   * @param config - Optional axios config
   * @returns Response data
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.executeWithRetry(() => this.client.patch<T>(url, data, config));
  }
}

/**
 * Global wger client instance
 */
export const wgerClient = new WgerClient();
