/**
 * MCP tool for retrieving user's workout routines
 * Requires authentication and returns routines with nested days and sets
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { authManager } from '../client/auth';
import { GetUserRoutinesSchema, GetUserRoutinesInput } from '../schemas/tools';
import { PaginatedResponse, Routine } from '../types/wger';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * MCP tool definition for get_user_routines
 */
export const getUserRoutinesTool: Tool = {
  name: 'get_user_routines',
  description:
    'Fetch all workout routines for the authenticated user with complete exercise lists, days, and set/rep schemes. Supports pagination.',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of routines to return (default: 20, max: 50)',
        minimum: 1,
        maximum: 50,
        default: 20,
      },
      offset: {
        type: 'number',
        description: 'Number of routines to skip for pagination (default: 0)',
        minimum: 0,
        default: 0,
      },
    },
  },
};

/**
 * Handler for get_user_routines tool
 * Retrieves all workout routines for the authenticated user
 *
 * @param args - Tool arguments containing pagination parameters
 * @returns Paginated response with user's workout routines
 * @throws AuthenticationError if user is not authenticated
 * @throws ValidationError if input validation fails
 * @throws ApiError if the wger API request fails
 */
export async function getUserRoutinesHandler(
  args: Record<string, unknown>
): Promise<PaginatedResponse<Routine>> {
  logger.info('Executing get_user_routines tool');

  // Validate authentication
  if (!authManager.hasCredentials()) {
    throw new AuthenticationError(
      'Authentication required to view workout routines. Please set WGER_API_KEY or WGER_USERNAME and WGER_PASSWORD environment variables.'
    );
  }

  // Validate input with defaults
  let validatedInput: GetUserRoutinesInput;
  try {
    validatedInput = GetUserRoutinesSchema.parse(args);
  } catch (error) {
    logger.warn('Input validation failed for get_user_routines', { args });
    throw new ValidationError('Invalid input for get_user_routines', error);
  }

  const { limit, offset } = validatedInput;

  logger.debug('Fetching user routines', { limit, offset });

  try {
    // Ensure we have a valid authentication token
    await authManager.getToken();

    // Fetch routines via API with pagination
    // Note: No caching as user data may change frequently
    const routines = await wgerClient.get<PaginatedResponse<Routine>>('/routine/', {
      params: {
        limit,
        offset,
      },
    });

    logger.info('Successfully fetched user routines', {
      count: routines.count,
      resultsReturned: routines.results.length,
    });

    return routines;
  } catch (error) {
    logger.error('Failed to fetch user routines', error instanceof Error ? error : undefined);
    throw error;
  }
}
