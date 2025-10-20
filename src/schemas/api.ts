/**
 * Zod schemas for runtime validation of wger API responses
 * These schemas match the TypeScript interfaces defined in types/wger.ts
 */

import { z } from 'zod';

/**
 * Schema for Exercise entity validation
 */
export const ExerciseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  uuid: z.string(),
  description: z.string(),
  category: z.number().int().positive(),
  muscles: z.array(z.number().int().positive()),
  muscles_secondary: z.array(z.number().int().positive()),
  equipment: z.array(z.number().int().positive()),
  language: z.number().int().positive(),
  license: z.number().int().positive(),
  license_author: z.string().nullable(),
  variations: z.array(z.number().int().positive()),
});

/**
 * Schema for ExerciseCategory entity validation
 */
export const CategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});

/**
 * Schema for Muscle entity validation
 */
export const MuscleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  name_en: z.string(), // Allow empty strings as API returns empty name_en for some muscles
  is_front: z.boolean(),
});

/**
 * Schema for Equipment entity validation
 */
export const EquipmentSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});

/**
 * Schema for Set entity validation
 */
export const SetSchema = z.object({
  id: z.number().int().positive(),
  exercise: z.number().int().positive(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().nonnegative(),
  order: z.number().int().positive(),
  comment: z.string(),
});

/**
 * Schema for Day entity validation
 */
export const DaySchema = z.object({
  id: z.number().int().positive(),
  description: z.string(),
  day: z.array(z.number().int().min(1).max(7)),
  sets: z.array(SetSchema),
});

/**
 * Schema for Workout entity validation
 */
export const WorkoutSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  creation_date: z.string(),
  days: z.array(DaySchema),
});

/**
 * Generic paginated response schema factory
 * Creates a schema for paginated responses with a specific item type
 */
export function createPaginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    count: z.number().int().nonnegative(),
    next: z.string().url().nullable(),
    previous: z.string().url().nullable(),
    results: z.array(itemSchema),
  });
}

/**
 * Paginated exercise response schema
 */
export const PaginatedExerciseSchema = createPaginatedSchema(ExerciseSchema);

/**
 * Paginated category response schema
 */
export const PaginatedCategorySchema = createPaginatedSchema(CategorySchema);

/**
 * Paginated muscle response schema
 */
export const PaginatedMuscleSchema = createPaginatedSchema(MuscleSchema);

/**
 * Paginated equipment response schema
 */
export const PaginatedEquipmentSchema = createPaginatedSchema(EquipmentSchema);

/**
 * Paginated workout response schema
 */
export const PaginatedWorkoutSchema = createPaginatedSchema(WorkoutSchema);

/**
 * Type inference helpers - export TypeScript types from schemas
 */
export type ExerciseType = z.infer<typeof ExerciseSchema>;
export type CategoryType = z.infer<typeof CategorySchema>;
export type MuscleType = z.infer<typeof MuscleSchema>;
export type EquipmentType = z.infer<typeof EquipmentSchema>;
export type SetType = z.infer<typeof SetSchema>;
export type DayType = z.infer<typeof DaySchema>;
export type WorkoutType = z.infer<typeof WorkoutSchema>;
export type PaginatedExerciseType = z.infer<typeof PaginatedExerciseSchema>;
export type PaginatedCategoryType = z.infer<typeof PaginatedCategorySchema>;
export type PaginatedMuscleType = z.infer<typeof PaginatedMuscleSchema>;
export type PaginatedEquipmentType = z.infer<typeof PaginatedEquipmentSchema>;
export type PaginatedWorkoutType = z.infer<typeof PaginatedWorkoutSchema>;
