/**
 * Zod schemas for runtime validation of MCP tool inputs
 * These schemas validate user-provided parameters before tool execution
 */

import { z } from 'zod';

/**
 * Schema for search_exercises tool input validation
 * Validates parameters for searching exercises with filters
 */
export const SearchExercisesSchema = z.object({
  /** Optional keyword search query */
  query: z.string().optional(),
  /** Optional muscle group ID to filter by */
  muscle: z
    .number()
    .int()
    .positive({
      message: 'Muscle ID must be a positive integer',
    })
    .optional(),
  /** Optional equipment ID to filter by */
  equipment: z
    .number()
    .int()
    .positive({
      message: 'Equipment ID must be a positive integer',
    })
    .optional(),
  /** Optional exercise category ID to filter by */
  category: z
    .number()
    .int()
    .positive({
      message: 'Category ID must be a positive integer',
    })
    .optional(),
  /** Number of results to return (default: 20, max: 100) */
  limit: z
    .number()
    .int()
    .min(1, {
      message: 'Limit must be at least 1',
    })
    .max(100, {
      message: 'Limit cannot exceed 100',
    })
    .default(20),
  /** Number of results to skip for pagination (default: 0) */
  offset: z
    .number()
    .int()
    .min(0, {
      message: 'Offset cannot be negative',
    })
    .default(0),
});

/**
 * Schema for get_exercise_details tool input validation
 * Validates exercise ID parameter
 */
export const GetExerciseDetailsSchema = z.object({
  /** Required exercise ID (must be a positive integer) */
  exerciseId: z.number().int().positive({
    message: 'Exercise ID must be a positive integer',
  }),
});

/**
 * Schema for create_workout tool input validation
 * Validates workout name, description, and date range
 */
export const CreateWorkoutSchema = z.object({
  /** Required workout name (1-100 characters) */
  name: z
    .string()
    .min(1, {
      message: 'Workout name is required and cannot be empty',
    })
    .max(100, {
      message: 'Workout name cannot exceed 100 characters',
    }),
  /** Optional workout description (max 500 characters) */
  description: z
    .string()
    .max(500, {
      message: 'Workout description cannot exceed 500 characters',
    })
    .optional(),
  /** Optional start date (YYYY-MM-DD format, defaults to today) */
  start: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Start date must be in YYYY-MM-DD format',
    })
    .optional(),
  /** Optional end date (YYYY-MM-DD format, defaults to 1 year from start) */
  end: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'End date must be in YYYY-MM-DD format',
    })
    .optional(),
});

/**
 * Schema for add_exercise_to_routine tool input validation
 * Validates all parameters for adding an exercise to a workout routine
 */
export const AddExerciseToRoutineSchema = z.object({
  /** Required routine ID */
  routineId: z.number().int().positive({
    message: 'Routine ID must be a positive integer',
  }),
  /** Required exercise ID to add */
  exerciseId: z.number().int().positive({
    message: 'Exercise ID must be a positive integer',
  }),
  /** Number of sets (1-10) */
  sets: z
    .number()
    .int()
    .min(1, {
      message: 'Sets must be at least 1',
    })
    .max(10, {
      message: 'Sets cannot exceed 10',
    }),
  /** Required number of reps per set (1-100) */
  reps: z
    .number()
    .int()
    .min(1, {
      message: 'Reps must be at least 1',
    })
    .max(100, {
      message: 'Reps cannot exceed 100',
    }),
  /** Optional weight in kg (must be non-negative) */
  weight: z
    .number()
    .min(0, {
      message: 'Weight cannot be negative',
    })
    .optional(),
  /** Optional day name (e.g., "Day 1", "Chest Day") */
  dayName: z
    .string()
    .max(100, {
      message: 'Day name cannot exceed 100 characters',
    })
    .optional(),
  /** Optional comment or notes (max 100 characters) */
  comment: z
    .string()
    .max(100, {
      message: 'Comment cannot exceed 100 characters',
    })
    .optional(),
});

/**
 * Schema for get_user_routines tool input validation
 * Validates pagination parameters for fetching user routines
 */
export const GetUserRoutinesSchema = z.object({
  /** Number of routines to return (default: 20, max: 100) */
  limit: z
    .number()
    .int()
    .min(1, {
      message: 'Limit must be at least 1',
    })
    .max(100, {
      message: 'Limit cannot exceed 100',
    })
    .default(20),
  /** Number of routines to skip for pagination (default: 0) */
  offset: z
    .number()
    .int()
    .min(0, {
      message: 'Offset cannot be negative',
    })
    .default(0),
});

/**
 * Type inference helpers - export TypeScript types from schemas
 * These types can be used throughout the codebase for type safety
 */
export type SearchExercisesInput = z.infer<typeof SearchExercisesSchema>;
export type GetExerciseDetailsInput = z.infer<typeof GetExerciseDetailsSchema>;
export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;
export type AddExerciseToRoutineInput = z.infer<typeof AddExerciseToRoutineSchema>;
export type GetUserRoutinesInput = z.infer<typeof GetUserRoutinesSchema>;
