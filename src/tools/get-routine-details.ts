/**
 * MCP tool for retrieving detailed routine information
 * Fetches the routine, its days, slots, and slot entries in a nested structure
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { authManager } from '../client/auth';
import { z } from 'zod';
import {
  Routine,
  Day,
  Slot,
  SlotEntry,
  SetsConfig,
  RepetitionsConfig,
  WeightConfig,
} from '../types/wger';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';

// Schema for input validation
const GetRoutineDetailsSchema = z.object({
  routineId: z.number().describe('ID of the routine to fetch details for'),
});

export const getRoutineDetailsTool: Tool = {
  name: 'get_routine_details',
  description:
    'Fetch detailed information about a routine, including its days, slots, and exercises (slot entries). Useful for understanding the full schedule of a routine.',
  inputSchema: {
    type: 'object',
    properties: {
      routineId: {
        type: 'number',
        description: 'ID of the routine to fetch details for',
      },
    },
    required: ['routineId'],
  },
};

// Interface for the detailed response
interface DetailedRoutine extends Routine {
  days: Array<
    Day & {
      slots: Array<
        Slot & {
          entries: Array<
            SlotEntry & {
              sets?: number;
              reps?: string;
              weight?: string;
            }
          >;
        }
      >;
    }
  >;
}

export async function getRoutineDetailsHandler(
  args: Record<string, unknown>
): Promise<DetailedRoutine> {
  logger.info('Executing get_routine_details tool');

  if (!authManager.hasCredentials()) {
    throw new AuthenticationError('Authentication required to view routine details.');
  }

  const { routineId } = GetRoutineDetailsSchema.parse(args);

  try {
    await authManager.getToken();

    // 1. Fetch Routine
    const routine = await wgerClient.get<Routine>(`/routine/${routineId}/`);

    // 2. Fetch Days
    const daysResponse = await wgerClient.get<{ results: Day[] }>('/day/', {
      params: { routine: routineId, limit: 100 },
    });
    // Manually filter by routine ID as API might return all days
    const days = daysResponse.results
      .filter((d) => d.routine === routineId)
      .sort((a, b) => a.order - b.order);

    // 3. Fetch all Slots, Entries, and Configs in parallel to minimize latency
    // Note: In a production app with huge data, we might want to batch this differently,
    // but for individual users, fetching all usually fits within limits.
    // However, wger API filtering is limited. We'll fetch by day IDs if possible,
    // or we have to fetch all for the routine if the API supports it.
    // Looking at wger API, /slot/ filters by day.

    // To avoid N+1 problem (looping through days to get slots), we check if we can filter/expand.
    // wger API doesn't seem to support deep expansion standardly.
    // We will iterate days for now as routines rarely have >7 days.

    const populatedDays = await Promise.all(
      days.map(async (day) => {
        // Get Slots for Day
        const slotsResponse = await wgerClient.get<{ results: Slot[] }>('/slot/', {
          params: { day: day.id, limit: 100 },
        });
        const slots = slotsResponse.results.sort((a, b) => a.order - b.order);

        const populatedSlots = await Promise.all(
          slots.map(async (slot) => {
            // Get Entries for Slot
            const entriesResponse = await wgerClient.get<{ results: SlotEntry[] }>('/slot-entry/', {
              params: { slot: slot.id, limit: 100 },
            });
            const entries = entriesResponse.results.sort((a, b) => a.order - b.order);

            // Fetch configs for entries
            const populatedEntries = await Promise.all(
              entries.map(async (entry) => {
                // We need sets, reps, weight configs.
                // These endpoints filter by slot_entry
                const [setsRes, repsRes, weightRes] = await Promise.all([
                  wgerClient.get<{ results: SetsConfig[] }>('/sets-config/', {
                    params: { slot_entry: entry.id },
                  }),
                  wgerClient.get<{ results: RepetitionsConfig[] }>('/repetitions-config/', {
                    params: { slot_entry: entry.id },
                  }),
                  wgerClient.get<{ results: WeightConfig[] }>('/weight-config/', {
                    params: { slot_entry: entry.id },
                  }),
                ]);

                return {
                  ...entry,
                  sets: setsRes.results[0]?.value,
                  reps: repsRes.results[0]?.value,
                  weight: weightRes.results[0]?.value,
                };
              })
            );

            return {
              ...slot,
              entries: populatedEntries,
            };
          })
        );

        return {
          ...day,
          slots: populatedSlots,
        };
      })
    );

    return {
      ...routine,
      days: populatedDays,
    };
  } catch (error) {
    logger.error('Failed to get routine details', error instanceof Error ? error : undefined);
    throw error;
  }
}
