/**
 * MCP tool: list_equipment
 * Returns all available equipment types from the wger API
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { cache } from '../client/cache';
import { config } from '../config';
import { PaginatedEquipmentSchema } from '../schemas/api';
import { Equipment } from '../types/wger';
import { logger } from '../utils/logger';

/**
 * Cache key for equipment data
 */
const CACHE_KEY = 'equipment:all';

/**
 * Tool definition for list_equipment
 * Fetches all equipment types that can be used for exercises
 */
export const listEquipmentTool: Tool = {
  name: 'list_equipment',
  description:
    'List all available equipment types from wger. Returns equipment with their IDs and names (e.g., barbell, dumbbell, kettlebell, bodyweight). Use this to find equipment IDs for filtering exercises by required equipment.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};

/**
 * Handler for list_equipment tool
 * Fetches and caches equipment types from the wger API
 *
 * @returns Object containing array of equipment types
 * @throws {ApiError} If the wger API request fails
 */
export async function listEquipmentHandler(): Promise<{ results: Equipment[] }> {
  logger.info('Fetching equipment types');

  // Check cache first
  const cached = cache.get<{ results: Equipment[] }>(CACHE_KEY);
  if (cached) {
    logger.debug('Returning cached equipment');
    return cached;
  }

  // Fetch from API
  const response = await wgerClient.get<unknown>('/equipment/');

  // Validate response structure
  const validatedResponse = PaginatedEquipmentSchema.parse(response);

  // Cache the results for 24 hours (static data)
  const result = { results: validatedResponse.results };
  cache.set(CACHE_KEY, result, config.cacheTtlStatic);

  logger.info(`Fetched ${validatedResponse.results.length} equipment types`);

  return result;
}
