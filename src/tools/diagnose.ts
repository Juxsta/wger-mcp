/**
 * Diagnostic tool to check configuration
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { config } from '../config';
import { authManager } from '../client/auth';

export const diagnoseTool: Tool = {
  name: 'diagnose',
  description: 'Diagnostic tool to check configuration',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function diagnoseHandler(): Promise<Record<string, unknown>> {
  return {
    hasApiKey: Boolean(config.wgerApiKey),
    apiUrl: config.wgerApiUrl,
    hasCredentials: authManager.hasCredentials(),
    apiKeyLength: config.wgerApiKey?.length || 0,
  };
}
