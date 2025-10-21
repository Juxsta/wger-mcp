/**
 * TypeScript interfaces for wger API entities
 * Based on wger API v2: https://wger.de/api/v2
 */

/**
 * License information entity
 */
export interface License {
  /** Unique license identifier */
  id: number;
  /** Full license name */
  full_name: string;
  /** Short license name/code */
  short_name: string;
  /** URL to license details */
  url: string;
}

/**
 * Exercise translation entity
 * Contains language-specific name and description
 */
export interface ExerciseTranslation {
  /** Unique translation identifier */
  id: number;
  /** Unique UUID for the translation */
  uuid: string;
  /** Exercise name in this language */
  name: string;
  /** Exercise ID reference */
  exercise: number;
  /** HTML-formatted exercise description */
  description: string;
  /** ISO 8601 timestamp when translation was created */
  created: string;
  /** Language ID */
  language: number;
  /** Array of exercise aliases */
  aliases: string[];
  /** Array of exercise notes */
  notes: string[];
  /** License ID */
  license: number;
  /** License title */
  license_title: string;
  /** License object URL */
  license_object_url: string;
  /** Author of the license */
  license_author: string;
  /** Author URL */
  license_author_url: string;
  /** Derivative source URL */
  license_derivative_source_url: string;
  /** Array of author names */
  author_history: string[];
}

/**
 * Exercise entity from wger API (exerciseinfo endpoint)
 * Represents a single exercise with all its metadata
 */
export interface Exercise {
  /** Unique exercise identifier */
  id: number;
  /** Unique UUID for the exercise */
  uuid: string;
  /** ISO 8601 timestamp when exercise was created */
  created: string;
  /** ISO 8601 timestamp when exercise was last updated */
  last_update: string;
  /** ISO 8601 timestamp when exercise was last updated globally */
  last_update_global: string;
  /** Category object (expanded, not just ID) */
  category: {
    id: number;
    name: string;
  };
  /** Array of primary muscle objects targeted by this exercise */
  muscles: Array<{
    id: number;
    name: string;
    name_en: string;
    is_front: boolean;
    image_url_main: string;
    image_url_secondary: string;
  }>;
  /** Array of secondary muscle objects engaged by this exercise */
  muscles_secondary: Array<{
    id: number;
    name: string;
    name_en: string;
    is_front: boolean;
    image_url_main: string;
    image_url_secondary: string;
  }>;
  /** Array of equipment objects required for this exercise */
  equipment: Array<{
    id: number;
    name: string;
  }>;
  /** License object */
  license: License;
  /** Author of the exercise content */
  license_author: string;
  /** Array of image objects */
  images: any[];
  /** Array of translation objects with name and description in multiple languages */
  translations: ExerciseTranslation[];
  /** Variation ID (can be null or a number) */
  variations: number | null;
  /** Array of video objects */
  videos: any[];
  /** Array of author names for this exercise */
  author_history: string[];
  /** Array of all author names including translations */
  total_authors_history: string[];
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
 * Routine entity (new API structure)
 * Represents a user's workout plan with a date range
 */
export interface Routine {
  /** Unique routine identifier */
  id: number;
  /** Routine name */
  name: string;
  /** Optional routine description */
  description: string;
  /** ISO 8601 timestamp when routine was created */
  created: string;
  /** Start date (YYYY-MM-DD format) */
  start: string;
  /** End date (YYYY-MM-DD format) */
  end: string;
  /** Whether the routine fits in a week */
  fit_in_week: boolean;
  /** Whether this is a template */
  is_template: boolean;
  /** Whether this is public */
  is_public: boolean;
}

/**
 * Day entity (new API structure)
 * Represents a single day within a routine
 */
export interface Day {
  /** Unique day identifier */
  id: number;
  /** Routine ID reference */
  routine: number;
  /** Order of this day in the routine */
  order: number;
  /** Day name */
  name: string;
  /** Optional day description */
  description: string;
  /** Whether this is a rest day */
  is_rest: boolean;
  /** Whether logs are needed to advance */
  need_logs_to_advance: boolean;
  /** Day type (custom, enom, amrap, hiit, tabata, etc.) */
  type: string;
  /** Optional config reference */
  config: number | null;
}

/**
 * Slot entity (new API structure)
 * Container for exercises within a day
 */
export interface Slot {
  /** Unique slot identifier */
  id: number;
  /** Day ID reference */
  day: number;
  /** Order of this slot in the day */
  order: number;
  /** Optional comment */
  comment: string;
  /** Optional config reference */
  config: number | null;
}

/**
 * Slot Entry entity (new API structure)
 * Links an exercise to a slot
 */
export interface SlotEntry {
  /** Unique slot entry identifier */
  id: number;
  /** Slot ID reference */
  slot: number;
  /** Exercise ID reference */
  exercise: number;
  /** Entry type (normal, dropset, myo, etc.) */
  type: string;
  /** Repetition unit reference */
  repetition_unit: number;
  /** Repetition rounding decimal */
  repetition_rounding: number | null;
  /** Weight unit reference */
  weight_unit: number;
  /** Weight rounding decimal */
  weight_rounding: number | null;
  /** Order of this entry in the slot */
  order: number;
  /** Optional comment */
  comment: string;
  /** Optional config reference */
  config: number | null;
}

/**
 * Sets Config entity
 * Defines number of sets for a slot entry
 */
export interface SetsConfig {
  /** Unique config identifier */
  id: number;
  /** Slot entry ID reference */
  slot_entry: number;
  /** Iteration number */
  iteration: number;
  /** Number of sets */
  value: number;
  /** Operation type (r=replace, +=add, -=subtract) */
  operation: string;
  /** Step type */
  step: string;
  /** Whether to repeat */
  repeat: boolean;
  /** Optional requirements JSON */
  requirements: any | null;
}

/**
 * Repetitions Config entity
 * Defines number of reps for a slot entry
 */
export interface RepetitionsConfig {
  /** Unique config identifier */
  id: number;
  /** Slot entry ID reference */
  slot_entry: number;
  /** Iteration number */
  iteration: number;
  /** Number of reps */
  value: string; // Decimal string
  /** Operation type */
  operation: string;
  /** Step type */
  step: string;
  /** Whether to repeat */
  repeat: boolean;
  /** Optional requirements JSON */
  requirements: any | null;
}

/**
 * Weight Config entity
 * Defines weight for a slot entry
 */
export interface WeightConfig {
  /** Unique config identifier */
  id: number;
  /** Slot entry ID reference */
  slot_entry: number;
  /** Iteration number */
  iteration: number;
  /** Weight value */
  value: string; // Decimal string
  /** Operation type */
  operation: string;
  /** Step type */
  step: string;
  /** Whether to repeat */
  repeat: boolean;
  /** Optional requirements JSON */
  requirements: any | null;
}

// Backwards compatibility alias
export interface Workout extends Routine {}
// Legacy Set interface - no longer used in new API
export interface Set {
  id: number;
  exercise: number;
  sets: number;
  reps: number;
  weight: number;
  order: number;
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
