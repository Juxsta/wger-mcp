/**
 * Test fixtures for wger API responses
 * Contains realistic sample data for use in unit and integration tests
 * Updated for wger API v2 with nested objects
 */

import {
  Exercise,
  ExerciseCategory,
  Muscle,
  Equipment,
  Routine,
  Day,
  Slot,
  SlotEntry,
  PaginatedResponse,
  License,
} from '../../src/types/wger';

/**
 * Sample license
 */
export const mockLicense: License = {
  id: 2,
  full_name: 'Creative Commons Attribution Share Alike 4.0 International',
  short_name: 'CC-BY-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-sa/4.0/',
};

/**
 * Sample exercise categories
 */
export const mockCategories: ExerciseCategory[] = [
  { id: 8, name: 'Arms' },
  { id: 10, name: 'Abs' },
  { id: 9, name: 'Legs' },
  { id: 11, name: 'Calves' },
  { id: 12, name: 'Back' },
  { id: 13, name: 'Shoulders' },
  { id: 14, name: 'Chest' },
];

/**
 * Sample muscle groups (base Muscle type)
 */
export const mockMuscles: Muscle[] = [
  { id: 1, name: 'Bizeps', name_en: 'Biceps', is_front: true },
  { id: 2, name: 'Latissimus dorsi', name_en: 'Lats', is_front: false },
  { id: 4, name: 'Brust', name_en: 'Chest', is_front: true },
  { id: 5, name: 'Schultern', name_en: 'Shoulders', is_front: true },
  { id: 6, name: 'Trizeps', name_en: 'Triceps', is_front: false },
  { id: 7, name: 'Quadrizeps', name_en: 'Quadriceps', is_front: true },
  { id: 8, name: 'Gesäß', name_en: 'Glutes', is_front: false },
  { id: 9, name: 'Bauch', name_en: 'Abs', is_front: true },
  { id: 10, name: 'Waden', name_en: 'Calves', is_front: false },
  { id: 11, name: 'Hamstrings', name_en: 'Hamstrings', is_front: false },
];

/**
 * Full muscle data with image URLs (matches Exercise inline type)
 */
type MuscleWithImages = {
  id: number;
  name: string;
  name_en: string;
  is_front: boolean;
  image_url_main: string;
  image_url_secondary: string;
};

const musclesWithImages: MuscleWithImages[] = [
  {
    id: 1,
    name: 'Bizeps',
    name_en: 'Biceps',
    is_front: true,
    image_url_main: '/static/images/muscles/main/muscle-1.svg',
    image_url_secondary: '/static/images/muscles/secondary/muscle-1.svg',
  },
  {
    id: 2,
    name: 'Latissimus dorsi',
    name_en: 'Lats',
    is_front: false,
    image_url_main: '/static/images/muscles/main/muscle-2.svg',
    image_url_secondary: '/static/images/muscles/secondary/muscle-2.svg',
  },
  {
    id: 4,
    name: 'Brust',
    name_en: 'Chest',
    is_front: true,
    image_url_main: '/static/images/muscles/main/muscle-4.svg',
    image_url_secondary: '/static/images/muscles/secondary/muscle-4.svg',
  },
  {
    id: 5,
    name: 'Schultern',
    name_en: 'Shoulders',
    is_front: true,
    image_url_main: '/static/images/muscles/main/muscle-5.svg',
    image_url_secondary: '/static/images/muscles/secondary/muscle-5.svg',
  },
  {
    id: 6,
    name: 'Trizeps',
    name_en: 'Triceps',
    is_front: false,
    image_url_main: '/static/images/muscles/main/muscle-6.svg',
    image_url_secondary: '/static/images/muscles/secondary/muscle-6.svg',
  },
  {
    id: 7,
    name: 'Quadrizeps',
    name_en: 'Quadriceps',
    is_front: true,
    image_url_main: '/static/images/muscles/main/muscle-7.svg',
    image_url_secondary: '/static/images/muscles/secondary/muscle-7.svg',
  },
  {
    id: 8,
    name: 'Gesäß',
    name_en: 'Glutes',
    is_front: false,
    image_url_main: '/static/images/muscles/main/muscle-8.svg',
    image_url_secondary: '/static/images/muscles/secondary/muscle-8.svg',
  },
  {
    id: 9,
    name: 'Bauch',
    name_en: 'Abs',
    is_front: true,
    image_url_main: '/static/images/muscles/main/muscle-9.svg',
    image_url_secondary: '/static/images/muscles/secondary/muscle-9.svg',
  },
  {
    id: 10,
    name: 'Waden',
    name_en: 'Calves',
    is_front: false,
    image_url_main: '/static/images/muscles/main/muscle-10.svg',
    image_url_secondary: '/static/images/muscles/secondary/muscle-10.svg',
  },
  {
    id: 11,
    name: 'Hamstrings',
    name_en: 'Hamstrings',
    is_front: false,
    image_url_main: '/static/images/muscles/main/muscle-11.svg',
    image_url_secondary: '/static/images/muscles/secondary/muscle-11.svg',
  },
];

/**
 * Sample equipment types
 */
export const mockEquipment: Equipment[] = [
  { id: 1, name: 'Barbell' },
  { id: 2, name: 'SZ-bar' },
  { id: 3, name: 'Dumbbell' },
  { id: 4, name: 'Gym mat' },
  { id: 7, name: 'Bench' },
  { id: 8, name: 'Incline bench' },
  { id: 9, name: 'Pull-up bar' },
  { id: 10, name: 'none (bodyweight exercise)' },
];

// Helper function to get muscle with images by ID
function getMuscleById(id: number): MuscleWithImages {
  const muscle = musclesWithImages.find((m) => m.id === id);
  if (!muscle) throw new Error(`Muscle with id ${id} not found`);
  return muscle;
}

// Helper function to get category by ID
function getCategoryById(id: number): ExerciseCategory {
  const category = mockCategories.find((c) => c.id === id);
  if (!category) throw new Error(`Category with id ${id} not found`);
  return category;
}

// Helper function to get equipment by ID
function getEquipmentById(id: number): Equipment {
  const equipment = mockEquipment.find((e) => e.id === id);
  if (!equipment) throw new Error(`Equipment with id ${id} not found`);
  return equipment;
}

/**
 * Sample exercises with complete data matching new API structure
 */
export const mockExercises: Exercise[] = [
  {
    id: 88,
    uuid: 'c788d643-150a-4ac7-97ef-84643c6419bf',
    created: '2024-01-01T10:00:00Z',
    last_update: '2024-01-15T10:30:00Z',
    last_update_global: '2024-01-15T10:30:00Z',
    category: getCategoryById(14),
    muscles: [getMuscleById(4)],
    muscles_secondary: [getMuscleById(5), getMuscleById(6)],
    equipment: [getEquipmentById(1), getEquipmentById(7)],
    license: mockLicense,
    license_author: 'wger.de',
    images: [],
    translations: [
      {
        id: 1,
        uuid: 'trans-1',
        name: 'Bench Press',
        exercise: 88,
        description:
          '<p>Lie on a bench with your feet flat on the floor. Grip the barbell slightly wider than shoulder width apart. Lower the bar to your chest, then press it back up to the starting position.</p>',
        created: '2024-01-01T10:00:00Z',
        language: 2,
      },
    ],
    variations: 89,
    videos: [],
    author_history: ['admin'],
    total_authors_history: ['admin', 'user123'],
  },
  {
    id: 123,
    uuid: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
    created: '2024-01-02T10:00:00Z',
    last_update: '2024-01-16T10:30:00Z',
    last_update_global: '2024-01-16T10:30:00Z',
    category: getCategoryById(9),
    muscles: [getMuscleById(7)],
    muscles_secondary: [getMuscleById(8), getMuscleById(11)],
    equipment: [getEquipmentById(1)],
    license: mockLicense,
    license_author: 'wger.de',
    images: [],
    translations: [
      {
        id: 2,
        uuid: 'trans-2',
        name: 'Barbell Squat',
        exercise: 123,
        description:
          '<p>Stand with your feet shoulder-width apart. Place the barbell on your upper back. Lower your body by bending your knees and hips, keeping your back straight. Push through your heels to return to the starting position.</p>',
        created: '2024-01-02T10:00:00Z',
        language: 2,
      },
    ],
    variations: 124,
    videos: [],
    author_history: ['admin'],
    total_authors_history: ['admin'],
  },
  {
    id: 456,
    uuid: 'f6e5d4c3-b2a1-9876-5432-fedcba987654',
    created: '2024-01-03T10:00:00Z',
    last_update: '2024-01-17T10:30:00Z',
    last_update_global: '2024-01-17T10:30:00Z',
    category: getCategoryById(12),
    muscles: [getMuscleById(2)],
    muscles_secondary: [getMuscleById(1), getMuscleById(5)],
    equipment: [getEquipmentById(9)],
    license: mockLicense,
    license_author: 'wger.de',
    images: [],
    translations: [
      {
        id: 3,
        uuid: 'trans-3',
        name: 'Pull-ups',
        exercise: 456,
        description:
          '<p>Hang from a pull-up bar with your hands shoulder-width apart. Pull your body up until your chin is over the bar. Lower yourself back down with control.</p>',
        created: '2024-01-03T10:00:00Z',
        language: 2,
      },
    ],
    variations: null,
    videos: [],
    author_history: ['admin'],
    total_authors_history: ['admin'],
  },
  {
    id: 789,
    uuid: '12345678-abcd-efgh-ijkl-mnopqrstuvwx',
    created: '2024-01-04T10:00:00Z',
    last_update: '2024-01-18T10:30:00Z',
    last_update_global: '2024-01-18T10:30:00Z',
    category: getCategoryById(8),
    muscles: [getMuscleById(1)],
    muscles_secondary: [],
    equipment: [getEquipmentById(3)],
    license: mockLicense,
    license_author: 'wger.de',
    images: [],
    translations: [
      {
        id: 4,
        uuid: 'trans-4',
        name: 'Dumbbell Curl',
        exercise: 789,
        description:
          '<p>Stand with dumbbells in each hand, arms fully extended. Curl the weights up to shoulder level while keeping your elbows stationary. Lower the weights back down with control.</p>',
        created: '2024-01-04T10:00:00Z',
        language: 2,
      },
    ],
    variations: null,
    videos: [],
    author_history: ['admin'],
    total_authors_history: ['admin'],
  },
  {
    id: 234,
    uuid: '98765432-zyxw-vutr-sqpo-nmlkjihgfed',
    created: '2024-01-05T10:00:00Z',
    last_update: '2024-01-19T10:30:00Z',
    last_update_global: '2024-01-19T10:30:00Z',
    category: getCategoryById(10),
    muscles: [getMuscleById(9)],
    muscles_secondary: [getMuscleById(5), getMuscleById(8)],
    equipment: [getEquipmentById(4)],
    license: mockLicense,
    license_author: 'wger.de',
    images: [],
    translations: [
      {
        id: 5,
        uuid: 'trans-5',
        name: 'Plank',
        exercise: 234,
        description:
          '<p>Get into a push-up position but rest on your forearms instead of your hands. Keep your body in a straight line from head to heels. Hold this position.</p>',
        created: '2024-01-05T10:00:00Z',
        language: 2,
      },
    ],
    variations: null,
    videos: [],
    author_history: ['admin'],
    total_authors_history: ['admin'],
  },
  {
    id: 567,
    uuid: 'abcdef12-3456-7890-abcd-ef1234567890',
    created: '2024-01-06T10:00:00Z',
    last_update: '2024-01-20T10:30:00Z',
    last_update_global: '2024-01-20T10:30:00Z',
    category: getCategoryById(13),
    muscles: [getMuscleById(5)],
    muscles_secondary: [getMuscleById(6)],
    equipment: [getEquipmentById(3)],
    license: mockLicense,
    license_author: 'wger.de',
    images: [],
    translations: [
      {
        id: 6,
        uuid: 'trans-6',
        name: 'Shoulder Press',
        exercise: 567,
        description:
          '<p>Stand or sit with dumbbells at shoulder height. Press the weights overhead until your arms are fully extended. Lower the weights back to shoulder height.</p>',
        created: '2024-01-06T10:00:00Z',
        language: 2,
      },
    ],
    variations: null,
    videos: [],
    author_history: ['admin'],
    total_authors_history: ['admin'],
  },
  {
    id: 890,
    uuid: 'fedcba09-8765-4321-fedc-ba0987654321',
    created: '2024-01-07T10:00:00Z',
    last_update: '2024-01-21T10:30:00Z',
    last_update_global: '2024-01-21T10:30:00Z',
    category: getCategoryById(12),
    muscles: [getMuscleById(2), getMuscleById(11)],
    muscles_secondary: [getMuscleById(7), getMuscleById(8)],
    equipment: [getEquipmentById(1)],
    license: mockLicense,
    license_author: 'wger.de',
    images: [],
    translations: [
      {
        id: 7,
        uuid: 'trans-7',
        name: 'Deadlift',
        exercise: 890,
        description:
          '<p>Stand with feet hip-width apart, barbell over mid-foot. Bend at hips and knees to grip the bar. Lift the bar by extending your hips and knees. Lower the bar back to the ground.</p>',
        created: '2024-01-07T10:00:00Z',
        language: 2,
      },
    ],
    variations: 891,
    videos: [],
    author_history: ['admin'],
    total_authors_history: ['admin'],
  },
  {
    id: 345,
    uuid: '11223344-5566-7788-99aa-bbccddeeff00',
    created: '2024-01-08T10:00:00Z',
    last_update: '2024-01-22T10:30:00Z',
    last_update_global: '2024-01-22T10:30:00Z',
    category: getCategoryById(9),
    muscles: [getMuscleById(7)],
    muscles_secondary: [getMuscleById(8), getMuscleById(11)],
    equipment: [getEquipmentById(1)],
    license: mockLicense,
    license_author: 'wger.de',
    images: [],
    translations: [
      {
        id: 8,
        uuid: 'trans-8',
        name: 'Leg Press',
        exercise: 345,
        description:
          '<p>Sit in the leg press machine with your feet shoulder-width apart on the platform. Push the platform away by extending your legs. Return to the starting position with control.</p>',
        created: '2024-01-08T10:00:00Z',
        language: 2,
      },
    ],
    variations: null,
    videos: [],
    author_history: ['admin'],
    total_authors_history: ['admin'],
  },
  {
    id: 678,
    uuid: 'aabbccdd-eeff-0011-2233-445566778899',
    created: '2024-01-09T10:00:00Z',
    last_update: '2024-01-23T10:30:00Z',
    last_update_global: '2024-01-23T10:30:00Z',
    category: getCategoryById(10),
    muscles: [getMuscleById(9)],
    muscles_secondary: [],
    equipment: [getEquipmentById(4)],
    license: mockLicense,
    license_author: 'wger.de',
    images: [],
    translations: [
      {
        id: 9,
        uuid: 'trans-9',
        name: 'Crunches',
        exercise: 678,
        description:
          '<p>Lie on your back with knees bent and feet flat on the floor. Place hands behind your head. Lift your shoulders off the ground by contracting your abs. Lower back down with control.</p>',
        created: '2024-01-09T10:00:00Z',
        language: 2,
      },
    ],
    variations: 679,
    videos: [],
    author_history: ['admin'],
    total_authors_history: ['admin'],
  },
  {
    id: 901,
    uuid: '99887766-5544-3322-1100-ffeeddccbbaa',
    created: '2024-01-10T10:00:00Z',
    last_update: '2024-01-24T10:30:00Z',
    last_update_global: '2024-01-24T10:30:00Z',
    category: getCategoryById(11),
    muscles: [getMuscleById(10)],
    muscles_secondary: [],
    equipment: [getEquipmentById(10)],
    license: mockLicense,
    license_author: 'wger.de',
    images: [],
    translations: [
      {
        id: 10,
        uuid: 'trans-10',
        name: 'Calf Raises',
        exercise: 901,
        description:
          '<p>Stand with the balls of your feet on an elevated surface. Lower your heels below the platform level. Push through the balls of your feet to raise your heels as high as possible.</p>',
        created: '2024-01-10T10:00:00Z',
        language: 2,
      },
    ],
    variations: null,
    videos: [],
    author_history: ['admin'],
    total_authors_history: ['admin'],
  },
];

/**
 * Sample routines for new API structure
 */
export const mockRoutines: Routine[] = [
  {
    id: 1,
    name: 'Push Day',
    description: 'Focus on chest, shoulders, and triceps',
    created: '2024-01-15T10:30:00Z',
    start: '2024-01-15',
    end: '2025-01-15',
    fit_in_week: false,
    is_template: false,
    is_public: false,
  },
  {
    id: 2,
    name: 'Full Body Workout',
    description: 'Complete full body routine for beginners',
    created: '2024-02-20T14:45:00Z',
    start: '2024-02-20',
    end: '2025-02-20',
    fit_in_week: false,
    is_template: false,
    is_public: false,
  },
];

/**
 * Sample days for new API structure
 */
export const mockDays: Day[] = [
  {
    id: 1,
    routine: 1,
    order: 1,
    name: 'Upper Body',
    description: 'Upper body workout',
    is_rest: false,
    need_logs_to_advance: false,
    type: 'custom',
    config: null,
  },
];

/**
 * Sample slots for new API structure
 */
export const mockSlots: Slot[] = [
  {
    id: 1,
    day: 1,
    order: 1,
    comment: '',
    config: null,
  },
];

/**
 * Sample slot entries for new API structure
 */
export const mockSlotEntries: SlotEntry[] = [
  {
    id: 1,
    slot: 1,
    exercise: 88,
    type: 'default',
    repetition_unit: 1,
    repetition_rounding: null,
    weight_unit: 1,
    weight_rounding: null,
    order: 1,
    comment: 'Warm up first',
    config: null,
  },
];

/**
 * Paginated response helpers
 */
export function createPaginatedResponse<T>(
  results: T[],
  count?: number,
  next?: string | null,
  previous?: string | null
): PaginatedResponse<T> {
  return {
    count: count ?? results.length,
    next: next ?? null,
    previous: previous ?? null,
    results,
  };
}

/**
 * Sample paginated responses
 */
export const mockPaginatedExercises = createPaginatedResponse(
  mockExercises,
  mockExercises.length
);

export const mockPaginatedCategories = createPaginatedResponse(
  mockCategories,
  mockCategories.length
);

export const mockPaginatedMuscles = createPaginatedResponse(mockMuscles, mockMuscles.length);

export const mockPaginatedEquipment = createPaginatedResponse(
  mockEquipment,
  mockEquipment.length
);

export const mockPaginatedRoutines = createPaginatedResponse(mockRoutines, mockRoutines.length);

/**
 * Backwards compatibility aliases
 */
export const mockWorkouts = mockRoutines;
export const mockPaginatedWorkouts = mockPaginatedRoutines;
export const mockSets = mockSlotEntries;

/**
 * Sample error responses
 */
export const mockErrorResponses = {
  unauthorized: {
    detail: 'Authentication credentials were not provided.',
    status: 401,
  },
  notFound: {
    detail: 'Not found.',
    status: 404,
  },
  rateLimited: {
    detail: 'Request was throttled. Expected available in 60 seconds.',
    status: 429,
  },
  serverError: {
    detail: 'Internal server error.',
    status: 500,
  },
  validationError: {
    detail: 'Invalid input.',
    status: 400,
  },
};

/**
 * Sample authentication token responses
 */
export const mockAuthResponses = {
  success: {
    access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImV4cCI6MTcwMDAwMDAwMH0.abc123',
    refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImV4cCI6MTcxMDAwMDAwMH0.def456',
  },
  refreshSuccess: {
    access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjMsImV4cCI6MTcwMDExMTExMX0.ghi789',
  },
};
