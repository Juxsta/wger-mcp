/**
 * MCP tool: list_categories
 * Returns all available exercise categories from the wger API
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { cache } from '../client/cache';
import { config } from '../config';
import { PaginatedCategorySchema } from '../schemas/api';
import { ExerciseCategory } from '../types/wger';
import { logger } from '../utils/logger';

/**
 * Cache key for categories data
 */
const CACHE_KEY = 'categories:all';

/**
 * Tool definition for list_categories
 * Fetches all exercise categories (strength, cardio, stretching, etc.)
 */
export const listCategoriesTool: Tool = {
  name: 'list_categories',
  description:
    'List all available exercise categories from wger. Categories include types like strength training, cardio, stretching, and more. Use this to understand what categories are available for filtering exercises.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

/**
 * Handler for list_categories tool
 * Fetches and caches exercise categories from the wger API
 *
 * @returns Object containing array of exercise categories
 * @throws {ApiError} If the wger API request fails
 */
export async function listCategoriesHandler(): Promise<{ results: ExerciseCategory[] }> {
  logger.info('Fetching exercise categories');

  // Check cache first
  const cached = cache.get<{ results: ExerciseCategory[] }>(CACHE_KEY);
  if (cached) {
    logger.debug('Returning cached categories');
    return cached;
  }

  // Fetch from API
  const response = await wgerClient.get<unknown>('/exercisecategory/');

  // Validate response structure
  const validatedResponse = PaginatedCategorySchema.parse(response);

  // Cache the results for 24 hours (static data)
  const result = { results: validatedResponse.results };
  cache.set(CACHE_KEY, result, config.cacheTtlStatic);

  logger.info(`Fetched ${validatedResponse.results.length} exercise categories`);

  return result;
}
