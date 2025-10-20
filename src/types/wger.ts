/**
 * TypeScript interfaces for wger API entities
 * Based on wger API v2: https://wger.de/api/v2
 */

/**
 * Exercise entity from wger API
 * Represents a single exercise with all its metadata
 */
export interface Exercise {
  /** Unique exercise identifier */
  id: number;
  /** Exercise name */
  name: string;
  /** Unique UUID for the exercise */
  uuid: string;
  /** HTML-formatted exercise description and instructions */
  description: string;
  /** Category ID (strength, cardio, stretching, etc.) */
  category: number;
  /** Array of primary muscle group IDs targeted by this exercise */
  muscles: number[];
  /** Array of secondary muscle group IDs engaged by this exercise */
  muscles_secondary: number[];
  /** Array of equipment IDs required for this exercise */
  equipment: number[];
  /** Language ID for the exercise content */
  language: number;
  /** License ID for the exercise content */
  license: number;
  /** Author of the exercise content (can be null for some exercises) */
  license_author: string | null;
  /** Array of variation exercise IDs */
  variations: number[];
}

/**
 * Exercise category entity
 * Represents a type of exercise (e.g., strength, cardio, stretching)
 */
export interface ExerciseCategory {
  /** Unique category identifier */
  id: number;
  /** Category name */
  name: string;
}

/**
 * Muscle group entity
 * Represents a specific muscle or muscle group that can be targeted
 */
export interface Muscle {
  /** Unique muscle identifier */
  id: number;
  /** Localized muscle name */
  name: string;
  /** English muscle name */
  name_en: string;
  /** Whether this muscle is on the front of the body */
  is_front: boolean;
}

/**
 * Equipment entity
 * Represents equipment that can be used for exercises
 */
export interface Equipment {
  /** Unique equipment identifier */
  id: number;
  /** Equipment name */
  name: string;
}

/**
 * Workout routine entity
 * Represents a user's workout plan with multiple days
 */
export interface Workout {
  /** Unique workout identifier */
  id: number;
  /** Workout name */
  name: string;
  /** Optional workout description */
  description: string;
  /** ISO 8601 date string when workout was created */
  creation_date: string;
  /** Array of day entities in this workout */
  days: Day[];
}

/**
 * Workout day entity
 * Represents a single day within a workout routine
 */
export interface Day {
  /** Unique day identifier */
  id: number;
  /** Optional day description */
  description: string;
  /** Array of day-of-week numbers (1=Monday, 7=Sunday) */
  day: number[];
  /** Array of exercise sets for this day */
  sets: Set[];
}

/**
 * Exercise set entity
 * Represents a specific exercise added to a workout day with parameters
 */
export interface Set {
  /** Unique set identifier */
  id: number;
  /** Exercise ID reference */
  exercise: number;
  /** Number of sets to perform */
  sets: number;
  /** Number of repetitions per set */
  reps: number;
  /** Weight in kilograms */
  weight: number;
  /** Order of this exercise in the day */
  order: number;
  /** Optional notes or comments */
  comment: string;
}

/**
 * Generic paginated response wrapper
 * Used for list endpoints that support pagination
 */
export interface PaginatedResponse<T> {
  /** Total number of items across all pages */
  count: number;
  /** URL to the next page of results, null if last page */
  next: string | null;
  /** URL to the previous page of results, null if first page */
  previous: string | null;
  /** Array of results for the current page */
  results: T[];
}
