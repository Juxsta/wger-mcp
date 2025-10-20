/**
 * MCP tool: get_exercise_details
 * Fetches comprehensive details for a specific exercise by ID
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { cache } from '../client/cache';
import { config } from '../config';
import { ExerciseSchema } from '../schemas/api';
import { GetExerciseDetailsSchema, GetExerciseDetailsInput } from '../schemas/tools';
import { Exercise } from '../types/wger';
import { ValidationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Generate cache key for exercise details
 * @param exerciseId - Exercise ID
 * @returns Cache key string
 */
function getCacheKey(exerciseId: number): string {
  return `exercise:${exerciseId}`;
}

/**
 * Tool definition for get_exercise_details
 * Fetches detailed information about a specific exercise
 */
export const getExerciseDetailsTool: Tool = {
  name: 'get_exercise_details',
  description:
    'Get comprehensive details for a specific exercise by ID. Returns full exercise information including name, description, muscles worked (primary and secondary), required equipment, category, and variations. Use search_exercises to find exercise IDs first.',
  inputSchema: {
    type: 'object',
    properties: {
      exerciseId: {
        type: 'number',
        description: 'The unique ID of the exercise to fetch details for',
      },
    },
    required: ['exerciseId'],
  },
};

/**
 * Handler for get_exercise_details tool
 * Fetches and caches exercise details from the wger API
 *
 * @param args - Parameters containing the exercise ID
 * @returns Detailed exercise information
 * @throws {ValidationError} If the exercise ID is invalid
 * @throws {NotFoundError} If the exercise is not found
 * @throws {ApiError} If the wger API request fails
 */
export async function getExerciseDetailsHandler(args: Record<string, unknown>): Promise<Exercise> {
  logger.info('Fetching exercise details', { args });

  // Validate and parse input
  let validatedInput: GetExerciseDetailsInput;
  try {
    validatedInput = GetExerciseDetailsSchema.parse(args);
  } catch (error) {
    logger.warn('Invalid exercise ID', { error });
    throw new ValidationError('Invalid exercise ID. Must be a positive integer.', error);
  }

  const { exerciseId } = validatedInput;
  const cacheKey = getCacheKey(exerciseId);

  // Check cache first (1 hour TTL)
  const cached = cache.get<Exercise>(cacheKey);
  if (cached) {
    logger.debug(`Returning cached exercise details for ID ${exerciseId}`);
    return cached;
  }

  // Fetch from API
  let response: unknown;
  try {
    response = await wgerClient.get<unknown>(`/exercise/${exerciseId}/`);
  } catch (error) {
    // Transform 404 errors to NotFoundError with user-friendly message
    if (error instanceof NotFoundError) {
      throw new NotFoundError(`Exercise with ID ${exerciseId} not found.`);
    }
    throw error;
  }

  // Validate response structure
  const validatedExercise = ExerciseSchema.parse(response);

  // Cache the result for 1 hour
  cache.set(cacheKey, validatedExercise, config.cacheTtlExercise);

  logger.info(`Fetched details for exercise ${exerciseId}: ${validatedExercise.name}`);

  return validatedExercise;
}
