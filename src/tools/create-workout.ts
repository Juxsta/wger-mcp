/**
 * MCP tool for creating workout routines
 * Requires authentication to create workouts for the authenticated user
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { authManager } from '../client/auth';
import { CreateWorkoutSchema, CreateWorkoutInput } from '../schemas/tools';
import { Workout } from '../types/wger';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * MCP tool definition for create_workout
 */
export const createWorkoutTool: Tool = {
  name: 'create_workout',
  description:
    'Create a new workout routine for the authenticated user. Returns the workout ID and metadata for use with add_exercise_to_routine.',
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
    },
    required: ['name'],
  },
};

/**
 * Handler for create_workout tool
 * Creates a new workout routine for the authenticated user
 *
 * @param args - Tool arguments containing workout name and optional description
 * @returns Created workout with ID and metadata
 * @throws AuthenticationError if user is not authenticated
 * @throws ValidationError if input validation fails
 * @throws ApiError if the wger API request fails
 */
export async function createWorkoutHandler(args: Record<string, unknown>): Promise<Workout> {
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

  const { name, description } = validatedInput;

  logger.debug('Creating workout', { name, hasDescription: !!description });

  try {
    // Ensure we have a valid authentication token
    await authManager.getToken();

    // Create workout via API
    const workout = await wgerClient.post<Workout>('/workout/', {
      name,
      description: description || '',
    });

    logger.info('Successfully created workout', { workoutId: workout.id, name: workout.name });

    return workout;
  } catch (error) {
    logger.error('Failed to create workout', error instanceof Error ? error : undefined);
    throw error;
  }
}
