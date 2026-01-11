/**
 * MCP server initialization and configuration
 * Sets up the server with stdio transport for Claude Desktop integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from './utils/logger';
import { getUserFriendlyMessage } from './utils/errors';

// Import exercise discovery tools
import { listCategoriesTool, listCategoriesHandler } from './tools/list-categories';
import { listMusclesTool, listMusclesHandler } from './tools/list-muscles';
import { listEquipmentTool, listEquipmentHandler } from './tools/list-equipment';
import { searchExercisesTool, searchExercisesHandler } from './tools/search-exercises';
import { getExerciseDetailsTool, getExerciseDetailsHandler } from './tools/get-exercise-details';

// Import workout routine management tools
import { createWorkoutTool, createWorkoutHandler } from './tools/create-workout';
import {
  addExerciseToRoutineTool,
  addExerciseToRoutineHandler,
} from './tools/add-exercise-to-routine';
import { getUserRoutinesTool, getUserRoutinesHandler } from './tools/get-user-routines';
import { getRoutineDetailsTool, getRoutineDetailsHandler } from './tools/get-routine-details';
import {
  addDayToRoutineTool,
  addDayToRoutineHandler,
  updateDayTool,
  updateDayHandler,
  deleteDayTool,
  deleteDayHandler,
} from './tools/manage-day';
import {
  updateExerciseInRoutineTool,
  updateExerciseInRoutineHandler,
} from './tools/update-exercise';
import { deleteSlotTool, deleteSlotHandler } from './tools/delete-slot';

// Import diagnostic tool
import { diagnoseTool, diagnoseHandler } from './tools/diagnose';

/**
 * Tool handler function type
 */
export type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

/**
 * MCP Server for wger fitness API
 * Manages tool registration and request handling
 */
export class WgerMCPServer {
  private server: Server;
  private tools: Map<string, { definition: Tool; handler: ToolHandler }>;

  constructor() {
    this.server = new Server(
      {
        name: 'wger-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.tools = new Map();
    this.setupHandlers();
  }

  /**
   * Register a tool with the MCP server
   * @param tool - Tool definition
   * @param handler - Function to handle tool execution
   */
  registerTool(tool: Tool, handler: ToolHandler): void {
    this.tools.set(tool.name, { definition: tool, handler });
    logger.info(`Registered tool: ${tool.name}`);
  }

  /**
   * Set up MCP protocol handlers
   */
  private setupHandlers(): void {
    // Handle list_tools request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('Handling list_tools request');
      return {
        tools: Array.from(this.tools.values()).map((t) => t.definition),
      };
    });

    // Handle call_tool request
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const toolName = request.params.name;
      logger.info(`Handling call_tool request: ${toolName}`);

      const tool = this.tools.get(toolName);

      if (!tool) {
        const errorMsg = `Unknown tool: ${toolName}`;
        logger.error(errorMsg);
        return {
          content: [
            {
              type: 'text',
              text: errorMsg,
            },
          ],
          isError: true,
        };
      }

      try {
        const args = (request.params.arguments as Record<string, unknown>) || {};
        logger.debug(`Executing tool: ${toolName}`, { args });

        const result = await tool.handler(args);

        logger.info(`Tool execution successful: ${toolName}`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = getUserFriendlyMessage(error);
        const errorObj = error instanceof Error ? error : undefined;
        logger.error(`Tool execution failed: ${toolName}`, errorObj);

        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Start the MCP server with stdio transport
   * This is the main entry point for the server
   */
  async start(): Promise<void> {
    logger.info('Starting wger MCP server');

    const transport = new StdioServerTransport();

    await this.server.connect(transport);

    logger.info('wger MCP server started successfully');
    logger.info(`Registered ${this.tools.size} tools`);

    // Log registered tools
    for (const toolName of this.tools.keys()) {
      logger.debug(`  - ${toolName}`);
    }
  }

  /**
   * Stop the MCP server gracefully
   */
  async stop(): Promise<void> {
    logger.info('Stopping wger MCP server');
    await this.server.close();
    logger.info('wger MCP server stopped');
  }

  /**
   * Get the underlying MCP server instance
   * Useful for testing
   */
  getServer(): Server {
    return this.server;
  }

  /**
   * Get number of registered tools
   */
  getToolCount(): number {
    return this.tools.size;
  }
}

/**
 * Create and configure the MCP server instance
 * Registers all available tools with their handlers
 */
export function createServer(): WgerMCPServer {
  const server = new WgerMCPServer();

  // Register exercise discovery tools
  server.registerTool(listCategoriesTool, listCategoriesHandler);
  server.registerTool(listMusclesTool, listMusclesHandler);
  server.registerTool(listEquipmentTool, listEquipmentHandler);
  server.registerTool(searchExercisesTool, searchExercisesHandler);
  server.registerTool(getExerciseDetailsTool, getExerciseDetailsHandler);

  // Register workout routine management tools
  server.registerTool(createWorkoutTool, createWorkoutHandler);
  server.registerTool(addExerciseToRoutineTool, addExerciseToRoutineHandler);
  server.registerTool(getUserRoutinesTool, getUserRoutinesHandler);
  server.registerTool(getRoutineDetailsTool, getRoutineDetailsHandler);
  server.registerTool(addDayToRoutineTool, addDayToRoutineHandler);
  server.registerTool(updateDayTool, updateDayHandler);
  server.registerTool(deleteDayTool, deleteDayHandler);
  server.registerTool(updateExerciseInRoutineTool, updateExerciseInRoutineHandler);
  server.registerTool(deleteSlotTool, deleteSlotHandler);

  // Register diagnostic tool
  server.registerTool(diagnoseTool, diagnoseHandler);

  return server;
}
