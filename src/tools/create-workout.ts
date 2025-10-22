/**
 * MCP tool for creating workout routines
 * Requires authentication to create workouts for the authenticated user
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { authManager } from '../client/auth';
import { CreateWorkoutSchema, CreateWorkoutInput } from '../schemas/tools';
import { Routine } from '../types/wger';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { RoutineSchema } from '../schemas/api';

/**
 * MCP tool definition for create_workout
 */
export const createWorkoutTool: Tool = {
  name: 'create_workout',
  description:
    'Create a new workout routine for the authenticated user. Returns the routine ID and metadata for use with add_exercise_to_routine. Requires a name and date range (defaults to 1 year starting today).',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Workout routine name (1-100 characters)',
        minLength: 1,
        maxLength: 100,
      },
      description: {
        type: 'string',
        description: 'Optional workout description (max 500 characters)',
        maxLength: 500,
      },
      start: {
        type: 'string',
        description: 'Start date in YYYY-MM-DD format (optional, defaults to today)',
      },
      end: {
        type: 'string',
        description: 'End date in YYYY-MM-DD format (optional, defaults to 1 year from start)',
      },
    },
    required: ['name'],
  },
};

/**
 * Handler for create_workout tool
 * Creates a new workout routine for the authenticated user
 *
 * @param args - Tool arguments containing routine name, optional description, and date range
 * @returns Created routine with ID and metadata
 * @throws AuthenticationError if user is not authenticated
 * @throws ValidationError if input validation fails
 * @throws ApiError if the wger API request fails
 */
export async function createWorkoutHandler(args: Record<string, unknown>): Promise<Routine> {
  logger.info('Executing create_workout tool');

  // Validate authentication
  if (!authManager.hasCredentials()) {
    throw new AuthenticationError(
      'Authentication required to create workouts. Please set WGER_API_KEY or WGER_USERNAME and WGER_PASSWORD environment variables.'
    );
  }

  // Validate input
  let validatedInput: CreateWorkoutInput;
  try {
    validatedInput = CreateWorkoutSchema.parse(args);
  } catch (error) {
    logger.warn('Input validation failed for create_workout', { args });
    throw new ValidationError('Invalid input for create_workout', error);
  }

  const { name, description, start, end } = validatedInput;

  // Set default dates if not provided
  const today = new Date();
  const startDate = start || today.toISOString().split('T')[0];
  const endDate =
    end ||
    new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
      .toISOString()
      .split('T')[0];

  logger.debug('Creating routine', { name, startDate, endDate, hasDescription: !!description });

  try {
    // Ensure we have a valid authentication token
    await authManager.getToken();

    // Create routine via API (new endpoint)
    const response = await wgerClient.post<unknown>('/routine/', {
      name,
      description: description || '',
      start: startDate,
      end: endDate,
    });

    // Validate response structure
    const routine = RoutineSchema.parse(response);

    logger.info('Successfully created routine', { routineId: routine.id, name: routine.name });

    return routine;
  } catch (error) {
    logger.error('Failed to create routine', error instanceof Error ? error : undefined);
    throw error;
  }
}
