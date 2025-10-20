import * as dotenv from 'dotenv';
import { z } from 'zod';
import * as path from 'path';

// Load environment variables from .env file
// When compiled to dist/config.js, go up one level to find .env in project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });
// Also try current working directory
dotenv.config();

/**
 * Environment configuration schema for runtime validation
 */
const ConfigSchema = z.object({
  // Authentication - at least one method required
  wgerApiKey: z.string().optional(),
  wgerUsername: z.string().optional(),
  wgerPassword: z.string().optional(),

  // API configuration
  wgerApiUrl: z.string().url().default('https://wger.de/api/v2'),
  httpTimeout: z.number().int().positive().default(10000),

  // Logging
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Cache TTL (in seconds)
  cacheTtlStatic: z.number().int().positive().default(86400), // 24 hours
  cacheTtlExercise: z.number().int().positive().default(3600), // 1 hour
});

/**
 * Parse and validate configuration from environment variables
 */
function loadConfig() {
  const rawConfig = {
    wgerApiKey: process.env.WGER_API_KEY,
    wgerUsername: process.env.WGER_USERNAME,
    wgerPassword: process.env.WGER_PASSWORD,
    wgerApiUrl: process.env.WGER_API_URL,
    httpTimeout: process.env.HTTP_TIMEOUT ? parseInt(process.env.HTTP_TIMEOUT, 10) : undefined,
    logLevel: process.env.LOG_LEVEL,
    cacheTtlStatic: process.env.CACHE_TTL_STATIC
      ? parseInt(process.env.CACHE_TTL_STATIC, 10)
      : undefined,
    cacheTtlExercise: process.env.CACHE_TTL_EXERCISE
      ? parseInt(process.env.CACHE_TTL_EXERCISE, 10)
      : undefined,
  };

  try {
    const config = ConfigSchema.parse(rawConfig);

    // Validate that at least one authentication method is provided
    if (!config.wgerApiKey && (!config.wgerUsername || !config.wgerPassword)) {
      throw new Error(
        'Authentication required: provide either WGER_API_KEY or both WGER_USERNAME and WGER_PASSWORD'
      );
    }

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Configuration validation failed: ${errors}`);
    }
    throw error;
  }
}

/**
 * Application configuration singleton
 */
export const config = loadConfig();

/**
 * Configuration type inferred from schema
 */
export type Config = z.infer<typeof ConfigSchema>;
