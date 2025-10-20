/**
 * MCP tool: list_muscles
 * Returns all available muscle groups from the wger API
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { cache } from '../client/cache';
import { config } from '../config';
import { PaginatedMuscleSchema } from '../schemas/api';
import { Muscle } from '../types/wger';
import { logger } from '../utils/logger';

/**
 * Cache key for muscles data
 */
const CACHE_KEY = 'muscles:all';

/**
 * Tool definition for list_muscles
 * Fetches all muscle groups that can be targeted with exercises
 */
export const listMusclesTool: Tool = {
  name: 'list_muscles',
  description:
    'List all available muscle groups from wger. Returns muscles with their IDs, names, and whether they are on the front or back of the body. Use this to find muscle IDs for filtering exercises by target muscle group.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

/**
 * Handler for list_muscles tool
 * Fetches and caches muscle groups from the wger API
 *
 * @returns Object containing array of muscle groups
 * @throws {ApiError} If the wger API request fails
 */
export async function listMusclesHandler(): Promise<{ results: Muscle[] }> {
  logger.info('Fetching muscle groups');

  // Check cache first
  const cached = cache.get<{ results: Muscle[] }>(CACHE_KEY);
  if (cached) {
    logger.debug('Returning cached muscles');
    return cached;
  }

  // Fetch from API
  const response = await wgerClient.get<unknown>('/muscle/');

  // Validate response structure
  const validatedResponse = PaginatedMuscleSchema.parse(response);

  // Cache the results for 24 hours (static data)
  const result = { results: validatedResponse.results };
  cache.set(CACHE_KEY, result, config.cacheTtlStatic);

  logger.info(`Fetched ${validatedResponse.results.length} muscle groups`);

  return result;
}
