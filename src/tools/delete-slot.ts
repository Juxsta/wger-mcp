/**
 * MCP tool for deleting a slot (exercise) from a routine
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { wgerClient } from '../client/wger-client';
import { authManager } from '../client/auth';
import { z } from 'zod';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';

const DeleteSlotSchema = z.object({
  slotId: z.number().describe('ID of the slot to delete'),
});

export const deleteSlotTool: Tool = {
  name: 'delete_slot',
  description: 'Remove a slot (containing an exercise) from a routine day.',
  inputSchema: {
    type: 'object',
    properties: {
      slotId: { type: 'number', description: 'ID of the slot to delete' },
    },
    required: ['slotId'],
  },
};

export async function deleteSlotHandler(
  args: Record<string, unknown>
): Promise<{ success: boolean; id: number }> {
  if (!authManager.hasCredentials()) throw new AuthenticationError('Authentication required.');
  const input = DeleteSlotSchema.parse(args);
  await authManager.getToken();

  // Note: In wger API v2, deleting the slot removes the slot entries associated with it.
  await wgerClient.delete(`/slot/${input.slotId}/`);

  logger.info(`Deleted slot ${input.slotId}`);
  return { success: true, id: input.slotId };
}
