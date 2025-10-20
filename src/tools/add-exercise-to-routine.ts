/**
 * MCP tool for adding exercises to workout routines
 * Requires authentication and creates sets with specified parameters
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { authManager } from '../client/auth';
import { AddExerciseToRoutineSchema, AddExerciseToRoutineInput } from '../schemas/tools';
import { Set } from '../types/wger';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * MCP tool definition for add_exercise_to_routine
 */
export const addExerciseToRoutineTool: Tool = {
  name: 'add_exercise_to_routine',
  description:
    'Add an exercise to an existing workout routine with specified sets, reps, weight, and order. Returns the created set details.',
  inputSchema: {
    type: 'object',
    properties: {
      workoutId: {
        type: 'number',
        description: 'ID of the workout routine to add the exercise to',
      },
      dayId: {
        type: 'number',
        description: 'ID of the day within the workout routine',
      },
      exerciseId: {
        type: 'number',
        description: 'ID of the exercise to add',
      },
      sets: {
        type: 'number',
        description: 'Number of sets to perform (1-10)',
        minimum: 1,
        maximum: 10,
      },
      reps: {
        type: 'number',
        description: 'Optional number of repetitions per set (1-100)',
        minimum: 1,
        maximum: 100,
      },
      weight: {
        type: 'number',
        description: 'Optional weight in kilograms (must be non-negative)',
        minimum: 0,
      },
      order: {
        type: 'number',
        description: 'Optional order of this exercise in the day',
        minimum: 1,
      },
      comment: {
        type: 'string',
        description: 'Optional notes or comments for this exercise (max 200 characters)',
        maxLength: 200,
      },
    },
    required: ['workoutId', 'dayId', 'exerciseId', 'sets'],
  },
};

/**
 * Handler for add_exercise_to_routine tool
 * Adds an exercise to a workout day with set/rep parameters
 *
 * @param args - Tool arguments containing workout, day, exercise IDs and parameters
 * @returns Created set with ID and details
 * @throws AuthenticationError if user is not authenticated
 * @throws ValidationError if input validation fails
 * @throws NotFoundError if workout, day, or exercise not found
 * @throws ApiError if the wger API request fails
 */
export async function addExerciseToRoutineHandler(args: Record<string, unknown>): Promise<Set> {
  logger.info('Executing add_exercise_to_routine tool');

  // Validate authentication
  if (!authManager.hasCredentials()) {
    throw new AuthenticationError(
      'Authentication required to add exercises to routines. Please set WGER_API_KEY or WGER_USERNAME and WGER_PASSWORD environment variables.'
    );
  }

  // Validate input
  let validatedInput: AddExerciseToRoutineInput;
  try {
    validatedInput = AddExerciseToRoutineSchema.parse(args);
  } catch (error) {
    logger.warn('Input validation failed for add_exercise_to_routine', { args });
    throw new ValidationError('Invalid input for add_exercise_to_routine', error);
  }

  const { workoutId, dayId, exerciseId, sets, reps, weight, order, comment } = validatedInput;

  logger.debug('Adding exercise to routine', {
    workoutId,
    dayId,
    exerciseId,
    sets,
    reps,
    weight,
    order,
  });

  try {
    // Ensure we have a valid authentication token
    await authManager.getToken();

    // Build request body with all parameters
    const requestBody: Record<string, unknown> = {
      exerciseday: dayId,
      exercise: exerciseId,
      sets,
    };

    // Add optional parameters if provided
    if (reps !== undefined) {
      requestBody.reps = reps;
    }
    if (weight !== undefined) {
      requestBody.weight = weight;
    }
    if (order !== undefined) {
      requestBody.order = order;
    }
    if (comment !== undefined) {
      requestBody.comment = comment;
    }

    // Create set via API
    const set = await wgerClient.post<Set>('/set/', requestBody);

    logger.info('Successfully added exercise to routine', {
      setId: set.id,
      workoutId,
      dayId,
      exerciseId,
    });

    return set;
  } catch (error) {
    logger.error('Failed to add exercise to routine', error instanceof Error ? error : undefined);
    throw error;
  }
}
