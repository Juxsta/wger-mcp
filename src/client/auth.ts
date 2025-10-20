/**
 * Authentication module for wger API
 * Handles JWT token management with automatic refresh
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';

interface TokenResponse {
  access: string;
  refresh: string;
}

interface TokenCache {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Authentication manager for wger API
 * Handles token acquisition, caching, and refresh
 */
export class AuthManager {
  private tokenCache: TokenCache | null = null;
  private readonly httpClient: AxiosInstance;
  private authInProgress: Promise<string> | null = null;

  constructor(baseURL: string = config.wgerApiUrl) {
    this.httpClient = axios.create({
      baseURL,
      timeout: config.httpTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get a valid authentication token
   * For wger API, returns the API key directly (no JWT exchange needed)
   * @returns Valid API token
   * @throws AuthenticationError if authentication fails
   */
  async getToken(): Promise<string> {
    // wger API uses token-based authentication where the API key IS the token
    // No need for JWT exchange - just return the API key directly
    if (config.wgerApiKey) {
      logger.debug('Using API key for authentication');
      return config.wgerApiKey;
    }

    // If no API key but username/password provided, need to get token
    if (config.wgerUsername && config.wgerPassword) {
      // If authentication is already in progress, wait for it
      if (this.authInProgress) {
        return this.authInProgress;
      }

      // Check if we have a valid cached token
      if (this.tokenCache && this.isTokenValid(this.tokenCache)) {
        logger.debug('Using cached authentication token');
        return this.tokenCache.accessToken;
      }

      // Check if we can refresh the token
      if (this.tokenCache && this.tokenCache.refreshToken) {
        try {
          logger.debug('Attempting to refresh authentication token');
          this.authInProgress = this.refreshToken();
          const token = await this.authInProgress;
          this.authInProgress = null;
          return token;
        } catch (error) {
          logger.warn('Token refresh failed, will request new token', { error });
          // Clear cache and fall through to request new token
          this.tokenCache = null;
        }
      }

      // Request new token
      logger.debug('Requesting new authentication token');
      this.authInProgress = this.requestToken();
      const token = await this.authInProgress;
      this.authInProgress = null;
      return token;
    }

    throw new AuthenticationError(
      'No authentication credentials provided. Please set WGER_API_KEY or WGER_USERNAME and WGER_PASSWORD environment variables.'
    );
  }

  /**
   * Check if the cached token is still valid
   * Considers token expired if it expires within 5 minutes
   * @param cache - Token cache to check
   * @returns True if token is valid
   */
  private isTokenValid(cache: TokenCache): boolean {
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return cache.expiresAt > fiveMinutesFromNow;
  }

  /**
   * Request a new JWT token from the API
   * Supports both API key and username/password authentication
   * @returns JWT access token
   * @throws AuthenticationError if authentication fails
   */
  private async requestToken(): Promise<string> {
    try {
      let response;

      // Try API key authentication first if available
      if (config.wgerApiKey) {
        logger.debug('Authenticating with API key');
        response = await this.httpClient.post<TokenResponse>('/token/', {
          api_key: config.wgerApiKey,
        });
      }
      // Fall back to username/password authentication
      else if (config.wgerUsername && config.wgerPassword) {
        logger.debug('Authenticating with username/password');
        response = await this.httpClient.post<TokenResponse>('/token/', {
          username: config.wgerUsername,
          password: config.wgerPassword,
        });
      } else {
        throw new AuthenticationError(
          'No authentication credentials provided. Please set WGER_API_KEY or WGER_USERNAME and WGER_PASSWORD environment variables.'
        );
      }

      const { access, refresh } = response.data;

      // Cache the token (JWT tokens typically expire in 1 hour)
      // We'll set expiry to 55 minutes to be safe
      this.tokenCache = {
        accessToken: access,
        refreshToken: refresh,
        expiresAt: Date.now() + 55 * 60 * 1000,
      };

      logger.info('Successfully authenticated with wger API');
      return access;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new AuthenticationError(
            'Authentication failed. Please verify your credentials.',
            error.response.data
          );
        }
        throw new AuthenticationError(
          `Authentication request failed: ${error.message}`,
          error.response?.data
        );
      }
      throw new AuthenticationError('Authentication request failed', error);
    }
  }

  /**
   * Refresh an existing JWT token using the refresh token
   * @returns New JWT access token
   * @throws AuthenticationError if refresh fails
   */
  private async refreshToken(): Promise<string> {
    if (!this.tokenCache?.refreshToken) {
      throw new AuthenticationError('No refresh token available');
    }

    try {
      const response = await this.httpClient.post<{ access: string }>('/token/refresh/', {
        refresh: this.tokenCache.refreshToken,
      });

      const { access } = response.data;

      // Update cached token with new access token
      this.tokenCache = {
        ...this.tokenCache,
        accessToken: access,
        expiresAt: Date.now() + 55 * 60 * 1000,
      };

      logger.info('Successfully refreshed authentication token');
      return access;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new AuthenticationError('Token refresh failed. Please re-authenticate.');
      }
      throw error;
    }
  }

  /**
   * Clear cached authentication token
   * Forces new authentication on next getToken() call
   */
  clearToken(): void {
    this.tokenCache = null;
    logger.debug('Cleared cached authentication token');
  }

  /**
   * Check if authentication credentials are configured
   * @returns True if credentials are available
   */
  hasCredentials(): boolean {
    return Boolean(config.wgerApiKey || (config.wgerUsername && config.wgerPassword));
  }

  /**
   * Handle authentication error with one retry
   * Clears cached token and attempts to re-authenticate
   * @param retryFn - Function to retry after re-authentication
   * @returns Result of retry function
   * @throws AuthenticationError if retry fails
   */
  async handleAuthError<T>(retryFn: () => Promise<T>): Promise<T> {
    logger.info('Handling authentication error, attempting to re-authenticate');
    this.clearToken();

    try {
      await this.getToken();
      return await retryFn();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Re-authentication failed', error);
    }
  }
}

/**
 * Global authentication manager instance
 */
export const authManager = new AuthManager();
