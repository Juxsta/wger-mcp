/**
 * MCP tool for adding exercises to workout routines
 * Requires authentication and creates slot entries with specified parameters
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { authManager } from '../client/auth';
import { AddExerciseToRoutineSchema, AddExerciseToRoutineInput } from '../schemas/tools';
import { SlotEntry, Day } from '../types/wger';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import {
  SlotEntrySchema,
  DaySchema,
  SlotSchema,
  SetsConfigSchema,
  RepetitionsConfigSchema,
  WeightConfigSchema,
} from '../schemas/api';

/**
 * MCP tool definition for add_exercise_to_routine
 */
export const addExerciseToRoutineTool: Tool = {
  name: 'add_exercise_to_routine',
  description:
    'Add an exercise to an existing workout routine with specified sets, reps, weight, and order. Automatically creates a day and slot if needed. Returns the created slot entry details.',
  inputSchema: {
    type: 'object',
    properties: {
      routineId: {
        type: 'number',
        description: 'ID of the routine to add the exercise to',
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
        description: 'Number of repetitions per set (1-100)',
        minimum: 1,
        maximum: 100,
      },
      weight: {
        type: 'number',
        description: 'Optional weight in kilograms (must be non-negative)',
        minimum: 0,
      },
      dayName: {
        type: 'string',
        description:
          'Optional name for the day (e.g., "Day 1", "Chest Day"). Creates new day if not found.',
      },
      comment: {
        type: 'string',
        description: 'Optional notes or comments for this exercise (max 100 characters)',
        maxLength: 100,
      },
    },
    required: ['routineId', 'exerciseId', 'sets', 'reps'],
  },
};

/**
 * Handler for add_exercise_to_routine tool
 * Adds an exercise to a routine by creating/finding day, slot, and slot entry with configs
 *
 * @param args - Parameters for adding the exercise
 * @returns Created slot entry with ID
 * @throws AuthenticationError if user is not authenticated
 * @throws ValidationError if input validation fails
 * @throws ApiError if the wger API request fails
 */
export async function addExerciseToRoutineHandler(
  args: Record<string, unknown>
): Promise<SlotEntry & { setsConfigId?: number; repsConfigId?: number; weightConfigId?: number }> {
  logger.info('Executing add_exercise_to_routine tool');

  // Validate authentication
  if (!authManager.hasCredentials()) {
    throw new AuthenticationError(
      'Authentication required to add exercises. Please set WGER_API_KEY or WGER_USERNAME and WGER_PASSWORD environment variables.'
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

  const { routineId, exerciseId, sets, reps, weight, dayName, comment } = validatedInput;

  logger.debug('Adding exercise to routine', { routineId, exerciseId, sets, reps, weight });

  try {
    // Ensure we have a valid authentication token
    await authManager.getToken();

    // Step 1: Find or create a day for this routine
    const dayNameToUse = dayName || 'Workout Day';
    let day: Day;

    // Try to find existing day
    const daysResponse = await wgerClient.get<{ results: unknown[] }>('/day/', {
      params: { routine: routineId },
    });

    const existingDays = daysResponse.results
      .map((d) => DaySchema.parse(d))
      .filter((d) => d.routine === routineId);
    const existingDay = existingDays.find((d) => d.name === dayNameToUse);

    if (existingDay) {
      day = existingDay;
      logger.debug(`Using existing day: ${day.id}`);
    } else {
      // Create new day
      const dayResponse = await wgerClient.post<unknown>('/day/', {
        routine: routineId,
        type: 'custom',
        name: dayNameToUse,
        is_rest: false,
        order: existingDays.length + 1,
      });
      day = DaySchema.parse(dayResponse);
      logger.debug(`Created new day: ${day.id}`);
    }

    // Step 2: Create a slot for this day
    const slotResponse = await wgerClient.post<unknown>('/slot/', {
      day: day.id,
      order: 1,
    });
    const slot = SlotSchema.parse(slotResponse);
    logger.debug(`Created slot: ${slot.id}`);

    // Step 3: Create slot entry (link exercise to slot)
    const slotEntryResponse = await wgerClient.post<unknown>('/slot-entry/', {
      slot: slot.id,
      exercise: exerciseId,
      order: 1,
      comment: comment || '',
    });
    const slotEntry = SlotEntrySchema.parse(slotEntryResponse);
    logger.debug(`Created slot entry: ${slotEntry.id}`);

    // Step 4: Create sets config
    const setsConfigResponse = await wgerClient.post<unknown>('/sets-config/', {
      slot_entry: slotEntry.id,
      iteration: 1,
      value: sets,
    });
    const setsConfig = SetsConfigSchema.parse(setsConfigResponse);
    logger.debug(`Created sets config: ${setsConfig.id}`);

    // Step 5: Create repetitions config
    const repsConfigResponse = await wgerClient.post<unknown>('/repetitions-config/', {
      slot_entry: slotEntry.id,
      iteration: 1,
      value: reps,
    });
    const repsConfig = RepetitionsConfigSchema.parse(repsConfigResponse);
    logger.debug(`Created reps config: ${repsConfig.id}`);

    // Step 6: Create weight config (if provided)
    let weightConfig;
    if (weight !== undefined) {
      const weightConfigResponse = await wgerClient.post<unknown>('/weight-config/', {
        slot_entry: slotEntry.id,
        iteration: 1,
        value: weight.toString(),
      });
      weightConfig = WeightConfigSchema.parse(weightConfigResponse);
      logger.debug(`Created weight config: ${weightConfig.id}`);
    }

    logger.info('Successfully added exercise to routine', {
      slotEntryId: slotEntry.id,
      exerciseId,
      sets,
      reps,
      weight,
    });

    return {
      ...slotEntry,
      setsConfigId: setsConfig.id,
      repsConfigId: repsConfig.id,
      weightConfigId: weightConfig?.id,
    };
  } catch (error) {
    logger.error('Failed to add exercise to routine', error instanceof Error ? error : undefined);
    throw error;
  }
}
