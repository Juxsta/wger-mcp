/**
 * Zod schemas for runtime validation of wger API responses
 * These schemas match the TypeScript interfaces defined in types/wger.ts
 */

import { z } from 'zod';

/**
 * Schema for License entity validation
 */
export const LicenseSchema = z.object({
  id: z.number().int().positive(),
  full_name: z.string(),
  short_name: z.string(),
  url: z.string(),
});

/**
 * Schema for ExerciseTranslation entity validation
 */
export const ExerciseTranslationSchema = z.object({
  id: z.number().int().positive(),
  uuid: z.string(),
  name: z.string(),
  exercise: z.number().int().positive(),
  description: z.string(),
  created: z.string(),
  language: z.number().int().positive(),
  aliases: z.array(z.string()),
  notes: z.array(z.string()),
  license: z.number().int().positive(),
  license_title: z.string(),
  license_object_url: z.string(),
  license_author: z.string(),
  license_author_url: z.string(),
  license_derivative_source_url: z.string(),
  author_history: z.array(z.string()),
});

/**
 * Schema for nested muscle object in Exercise
 */
const ExerciseMuscleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  name_en: z.string(),
  is_front: z.boolean(),
  image_url_main: z.string(),
  image_url_secondary: z.string(),
});

/**
 * Schema for nested equipment object in Exercise
 */
const ExerciseEquipmentSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

/**
 * Schema for nested category object in Exercise
 */
const ExerciseCategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

/**
 * Schema for Exercise entity validation (exerciseinfo endpoint)
 */
export const ExerciseSchema = z.object({
  id: z.number().int().positive(),
  uuid: z.string(),
  created: z.string(),
  last_update: z.string(),
  last_update_global: z.string(),
  category: ExerciseCategorySchema,
  muscles: z.array(ExerciseMuscleSchema),
  muscles_secondary: z.array(ExerciseMuscleSchema),
  equipment: z.array(ExerciseEquipmentSchema),
  license: LicenseSchema,
  license_author: z.string(),
  images: z.array(z.any()),
  translations: z.array(ExerciseTranslationSchema),
  variations: z.number().int().positive().nullable(),
  videos: z.array(z.any()),
  author_history: z.array(z.string()),
  total_authors_history: z.array(z.string()),
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
 * Schema for Routine entity validation (new API)
 */
export const RoutineSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  description: z.string(),
  created: z.string(),
  start: z.string(), // YYYY-MM-DD format
  end: z.string(), // YYYY-MM-DD format
  fit_in_week: z.boolean(),
  is_template: z.boolean(),
  is_public: z.boolean(),
});

/**
 * Schema for Day entity validation (new API)
 */
export const DaySchema = z.object({
  id: z.number().int().positive(),
  routine: z.number().int().positive(),
  order: z.number().int().min(0),
  name: z.string(),
  description: z.string(),
  is_rest: z.boolean(),
  need_logs_to_advance: z.boolean(),
  type: z.string(),
  config: z.number().int().positive().nullable(),
});

/**
 * Schema for Slot entity validation (new API)
 */
export const SlotSchema = z.object({
  id: z.number().int().positive(),
  day: z.number().int().positive(),
  order: z.number().int().min(0),
  comment: z.string(),
  config: z.number().int().positive().nullable(),
});

/**
 * Schema for SlotEntry entity validation (new API)
 */
export const SlotEntrySchema = z.object({
  id: z.number().int().positive(),
  slot: z.number().int().positive(),
  exercise: z.number().int().positive(),
  type: z.string(),
  repetition_unit: z.number().int().positive(),
  repetition_rounding: z.number().nullable(),
  weight_unit: z.number().int().positive(),
  weight_rounding: z.number().nullable(),
  order: z.number().int().min(0),
  comment: z.string(),
  config: z.number().int().positive().nullable(),
});

/**
 * Schema for SetsConfig entity validation
 */
export const SetsConfigSchema = z.object({
  id: z.number().int().positive(),
  slot_entry: z.number().int().positive(),
  iteration: z.number().int().positive(),
  value: z.number().int().positive(),
  operation: z.string(),
  step: z.string(),
  repeat: z.boolean(),
  requirements: z.any().nullable(),
});

/**
 * Schema for RepetitionsConfig entity validation
 */
export const RepetitionsConfigSchema = z.object({
  id: z.number().int().positive(),
  slot_entry: z.number().int().positive(),
  iteration: z.number().int().positive(),
  value: z.string(), // Decimal string
  operation: z.string(),
  step: z.string(),
  repeat: z.boolean(),
  requirements: z.any().nullable(),
});

/**
 * Schema for WeightConfig entity validation
 */
export const WeightConfigSchema = z.object({
  id: z.number().int().positive(),
  slot_entry: z.number().int().positive(),
  iteration: z.number().int().positive(),
  value: z.string(), // Decimal string
  operation: z.string(),
  step: z.string(),
  repeat: z.boolean(),
  requirements: z.any().nullable(),
});

// Backwards compatibility - alias Workout to Routine
export const WorkoutSchema = RoutineSchema;
// Legacy Set schema - kept for backwards compatibility
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
 * Paginated routine response schema
 */
export const PaginatedRoutineSchema = createPaginatedSchema(RoutineSchema);

/**
 * Paginated workout response schema (backwards compatibility)
 */
export const PaginatedWorkoutSchema = PaginatedRoutineSchema;

/**
 * Type inference helpers - export TypeScript types from schemas
 */
export type ExerciseType = z.infer<typeof ExerciseSchema>;
export type CategoryType = z.infer<typeof CategorySchema>;
export type MuscleType = z.infer<typeof MuscleSchema>;
export type EquipmentType = z.infer<typeof EquipmentSchema>;
export type RoutineType = z.infer<typeof RoutineSchema>;
export type DayType = z.infer<typeof DaySchema>;
export type SlotType = z.infer<typeof SlotSchema>;
export type SlotEntryType = z.infer<typeof SlotEntrySchema>;
export type SetsConfigType = z.infer<typeof SetsConfigSchema>;
export type RepetitionsConfigType = z.infer<typeof RepetitionsConfigSchema>;
export type WeightConfigType = z.infer<typeof WeightConfigSchema>;
export type SetType = z.infer<typeof SetSchema>;
export type WorkoutType = z.infer<typeof WorkoutSchema>;
export type PaginatedExerciseType = z.infer<typeof PaginatedExerciseSchema>;
export type PaginatedCategoryType = z.infer<typeof PaginatedCategorySchema>;
export type PaginatedMuscleType = z.infer<typeof PaginatedMuscleSchema>;
export type PaginatedEquipmentType = z.infer<typeof PaginatedEquipmentSchema>;
export type PaginatedRoutineType = z.infer<typeof PaginatedRoutineSchema>;
export type PaginatedWorkoutType = z.infer<typeof PaginatedWorkoutSchema>;
