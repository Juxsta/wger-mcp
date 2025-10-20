/**
 * MCP tool: search_exercises
 * Searches for exercises with optional filters for muscle, equipment, category, and keywords
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { PaginatedExerciseSchema } from '../schemas/api';
import { SearchExercisesSchema, SearchExercisesInput } from '../schemas/tools';
import { PaginatedResponse, Exercise } from '../types/wger';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Tool definition for search_exercises
 * Allows searching and filtering exercises by various criteria
 */
export const searchExercisesTool: Tool = {
  name: 'search_exercises',
  description:
    'Search for exercises with optional filters. You can filter by keyword query, muscle group ID, equipment ID, and category ID. Supports pagination with limit and offset parameters. Use list_muscles, list_equipment, and list_categories to get valid filter IDs.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Optional keyword to search in exercise names and descriptions',
      },
      muscle: {
        type: 'number',
        description: 'Optional muscle group ID to filter exercises by target muscle',
      },
      equipment: {
        type: 'number',
        description: 'Optional equipment ID to filter exercises by required equipment',
      },
      category: {
        type: 'number',
        description: 'Optional category ID to filter exercises by type (strength, cardio, etc.)',
      },
      limit: {
        type: 'number',
        description: 'Number of results to return (default: 20, max: 100)',
        default: 20,
      },
      offset: {
        type: 'number',
        description: 'Number of results to skip for pagination (default: 0)',
        default: 0,
      },
    },
    required: [],
  },
};

/**
 * Handler for search_exercises tool
 * Searches exercises with filters and returns paginated results
 *
 * @param args - Search parameters including filters and pagination
 * @returns Paginated response with exercise results
 * @throws {ValidationError} If input parameters are invalid
 * @throws {ApiError} If the wger API request fails
 */
export async function searchExercisesHandler(
  args: Record<string, unknown>
): Promise<PaginatedResponse<Exercise>> {
  logger.info('Searching exercises', { args });

  // Validate and parse input
  let validatedInput: SearchExercisesInput;
  try {
    validatedInput = SearchExercisesSchema.parse(args);
  } catch (error) {
    logger.warn('Invalid search parameters', { error });
    throw new ValidationError('Invalid search parameters. Check your input values.', error);
  }

  // Build query parameters
  const params: Record<string, string | number> = {
    limit: validatedInput.limit,
    offset: validatedInput.offset,
  };

  if (validatedInput.query) {
    params.search = validatedInput.query;
  }

  if (validatedInput.muscle !== undefined) {
    params.muscles = validatedInput.muscle;
  }

  if (validatedInput.equipment !== undefined) {
    params.equipment = validatedInput.equipment;
  }

  if (validatedInput.category !== undefined) {
    params.category = validatedInput.category;
  }

  // Fetch from API with query parameters
  const response = await wgerClient.get<unknown>('/exercise/', { params });

  // Validate response structure
  const validatedResponse = PaginatedExerciseSchema.parse(response);

  logger.info(`Found ${validatedResponse.count} exercises`, {
    returned: validatedResponse.results.length,
    hasNext: !!validatedResponse.next,
  });

  return validatedResponse;
}
