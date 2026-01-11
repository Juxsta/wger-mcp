/**
 * MCP tools for managing days in a workout routine
 * Includes adding, updating, and deleting days
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { authManager } from '../client/auth';
import { z } from 'zod';
import { Day } from '../types/wger';
import { DaySchema } from '../schemas/api';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';

// Schemas
const AddDaySchema = z.object({
  routineId: z.number().describe('ID of the routine to add the day to'),
  description: z.string().optional().describe('Description of the day'),
  is_rest: z.boolean().optional().default(false).describe('Whether this is a rest day'),
});

const UpdateDaySchema = z.object({
  dayId: z.number().describe('ID of the day to update'),
  description: z.string().optional().describe('New description for the day'),
  is_rest: z.boolean().optional().describe('Update rest day status'),
  name: z.string().optional().describe('New name/label for the day'),
});

const DeleteDaySchema = z.object({
  dayId: z.number().describe('ID of the day to delete'),
});

// Tool Definitions
export const addDayToRoutineTool: Tool = {
  name: 'add_day_to_routine',
  description: 'Add a new day to an existing workout routine.',
  inputSchema: {
    type: 'object',
    properties: {
      routineId: { type: 'number', description: 'ID of the routine' },
      description: { type: 'string', description: 'Description of the day' },
      is_rest: { type: 'boolean', description: 'Is this a rest day? Default false' },
    },
    required: ['routineId', 'description'],
  },
};

export const updateDayTool: Tool = {
  name: 'update_day',
  description: 'Update the details of a specific day in a routine.',
  inputSchema: {
    type: 'object',
    properties: {
      dayId: { type: 'number', description: 'ID of the day to update' },
      description: { type: 'string', description: 'New description' },
      is_rest: { type: 'boolean', description: 'Set as rest day' },
      name: { type: 'string', description: 'New name for the day' },
    },
    required: ['dayId'],
  },
};

export const deleteDayTool: Tool = {
  name: 'delete_day',
  description: 'Remove a day from a routine.',
  inputSchema: {
    type: 'object',
    properties: {
      dayId: { type: 'number', description: 'ID of the day to delete' },
    },
    required: ['dayId'],
  },
};

// Handlers

export async function addDayToRoutineHandler(args: Record<string, unknown>): Promise<Day> {
  if (!authManager.hasCredentials()) throw new AuthenticationError('Authentication required.');
  const input = AddDaySchema.parse(args);
  await authManager.getToken();

  // Get current days to determine order
  const daysRes = await wgerClient.get<{ results: Day[] }>('/day/', {
    params: { routine: input.routineId },
  });
  const currentCount = daysRes.results.length;

  const day = await wgerClient.post<unknown>('/day/', {
    routine: input.routineId,
    description: input.description,
    is_rest: input.is_rest,
    order: currentCount + 1, // Append to end
    // Name is often derived from order or description in some clients, but we can set a default if not provided
    // wger requires 'day' object to often have a 'training' field or similar depending on version,
    // but based on API docs: routine, description, day (array of ints for DOW) are common.
    // wait, wger v2/day/ uses 'description' and 'day' (days of week).
    // Actually, looking at previous research, 'name' is 50 chars max.
    name: input.description?.substring(0, 50) || `Day ${currentCount + 1}`,
  });

  logger.info(`Added day to routine ${input.routineId}`);
  return DaySchema.parse(day);
}

export async function updateDayHandler(args: Record<string, unknown>): Promise<Day> {
  if (!authManager.hasCredentials()) throw new AuthenticationError('Authentication required.');
  const input = UpdateDaySchema.parse(args);
  await authManager.getToken();

  const day = await wgerClient.patch<unknown>(`/day/${input.dayId}/`, {
    description: input.description,
    is_rest: input.is_rest,
    name: input.name,
  });

  logger.info(`Updated day ${input.dayId}`);
  return DaySchema.parse(day);
}

export async function deleteDayHandler(
  args: Record<string, unknown>
): Promise<{ success: boolean; id: number }> {
  if (!authManager.hasCredentials()) throw new AuthenticationError('Authentication required.');
  const input = DeleteDaySchema.parse(args);
  await authManager.getToken();

  await wgerClient.delete(`/day/${input.dayId}/`);

  logger.info(`Deleted day ${input.dayId}`);
  return { success: true, id: input.dayId };
}
