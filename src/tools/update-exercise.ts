/**
 * MCP tool for updating exercise configuration in a routine
 * Allows modifying sets, reps, and weight for a specific slot entry
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { authManager } from '../client/auth';
import { z } from 'zod';
import { SetsConfig, RepetitionsConfig, WeightConfig } from '../types/wger';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';

const UpdateExerciseSchema = z.object({
  slotEntryId: z.number().describe('ID of the slot entry (exercise in routine) to update'),
  sets: z.number().optional().describe('New number of sets'),
  reps: z.number().optional().describe('New number of repetitions'),
  weight: z.number().optional().describe('New weight value'),
});

export const updateExerciseInRoutineTool: Tool = {
  name: 'update_exercise_in_routine',
  description:
    'Update the configuration (sets, reps, weight) for an exercise already in a routine.',
  inputSchema: {
    type: 'object',
    properties: {
      slotEntryId: { type: 'number', description: 'ID of the slot entry' },
      sets: { type: 'number', description: 'Number of sets' },
      reps: { type: 'number', description: 'Number of reps' },
      weight: { type: 'number', description: 'Weight in kg' },
    },
    required: ['slotEntryId'],
  },
};

export async function updateExerciseInRoutineHandler(args: Record<string, unknown>): Promise<{
  success: boolean;
  updates: string[];
}> {
  if (!authManager.hasCredentials()) throw new AuthenticationError('Authentication required.');
  const input = UpdateExerciseSchema.parse(args);
  await authManager.getToken();

  const updates: string[] = [];

  // 1. Handle SETS
  if (input.sets !== undefined) {
    // Find existing config
    const setsRes = await wgerClient.get<{ results: SetsConfig[] }>('/sets-config/', {
      params: { slot_entry: input.slotEntryId },
    });

    if (setsRes.results.length > 0) {
      // Update existing
      await wgerClient.patch(`/sets-config/${setsRes.results[0].id}/`, {
        value: input.sets,
      });
      updates.push('sets (updated)');
    } else {
      // Create new
      await wgerClient.post('/sets-config/', {
        slot_entry: input.slotEntryId,
        iteration: 1,
        value: input.sets,
      });
      updates.push('sets (created)');
    }
  }

  // 2. Handle REPS
  if (input.reps !== undefined) {
    const repsRes = await wgerClient.get<{ results: RepetitionsConfig[] }>('/repetitions-config/', {
      params: { slot_entry: input.slotEntryId },
    });

    if (repsRes.results.length > 0) {
      await wgerClient.patch(`/repetitions-config/${repsRes.results[0].id}/`, {
        value: input.reps,
      });
      updates.push('reps (updated)');
    } else {
      await wgerClient.post('/repetitions-config/', {
        slot_entry: input.slotEntryId,
        iteration: 1,
        value: input.reps,
      });
      updates.push('reps (created)');
    }
  }

  // 3. Handle WEIGHT
  if (input.weight !== undefined) {
    const weightRes = await wgerClient.get<{ results: WeightConfig[] }>('/weight-config/', {
      params: { slot_entry: input.slotEntryId },
    });

    if (weightRes.results.length > 0) {
      await wgerClient.patch(`/weight-config/${weightRes.results[0].id}/`, {
        value: input.weight.toString(),
      });
      updates.push('weight (updated)');
    } else {
      await wgerClient.post('/weight-config/', {
        slot_entry: input.slotEntryId,
        iteration: 1,
        value: input.weight.toString(),
      });
      updates.push('weight (created)');
    }
  }

  logger.info(`Updated exercise ${input.slotEntryId}: ${updates.join(', ')}`);
  return { success: true, updates };
}
