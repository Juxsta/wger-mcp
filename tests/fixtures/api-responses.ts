/**
 * Test fixtures for wger API responses
 * Contains realistic sample data for use in unit and integration tests
 */

import {
  Exercise,
  ExerciseCategory,
  Muscle,
  Equipment,
  Workout,
  Day,
  Set,
  PaginatedResponse,
} from '../../src/types/wger';

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
 * Sample muscle groups
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

/**
 * Sample exercises with complete data
 */
export const mockExercises: Exercise[] = [
  {
    id: 88,
    uuid: 'c788d643-150a-4ac7-97ef-84643c6419bf',
    name: 'Bench Press',
    description: '<p>Lie on a bench with your feet flat on the floor. Grip the barbell slightly wider than shoulder width apart. Lower the bar to your chest, then press it back up to the starting position.</p>',
    category: 14,
    muscles: [4],
    muscles_secondary: [5, 6],
    equipment: [1, 7],
    language: 2,
    license: 2,
    license_author: 'wger.de',
    variations: [89, 90],
  },
  {
    id: 123,
    uuid: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
    name: 'Barbell Squat',
    description: '<p>Stand with your feet shoulder-width apart. Place the barbell on your upper back. Lower your body by bending your knees and hips, keeping your back straight. Push through your heels to return to the starting position.</p>',
    category: 9,
    muscles: [7],
    muscles_secondary: [8, 11],
    equipment: [1],
    language: 2,
    license: 2,
    license_author: 'wger.de',
    variations: [124, 125],
  },
  {
    id: 456,
    uuid: 'f6e5d4c3-b2a1-9876-5432-fedcba987654',
    name: 'Pull-ups',
    description: '<p>Hang from a pull-up bar with your hands shoulder-width apart. Pull your body up until your chin is over the bar. Lower yourself back down with control.</p>',
    category: 12,
    muscles: [2],
    muscles_secondary: [1, 5],
    equipment: [9],
    language: 2,
    license: 2,
    license_author: 'wger.de',
    variations: [457, 458],
  },
  {
    id: 789,
    uuid: '12345678-abcd-efgh-ijkl-mnopqrstuvwx',
    name: 'Dumbbell Curl',
    description: '<p>Stand with dumbbells in each hand, arms fully extended. Curl the weights up to shoulder level while keeping your elbows stationary. Lower the weights back down with control.</p>',
    category: 8,
    muscles: [1],
    muscles_secondary: [],
    equipment: [3],
    language: 2,
    license: 2,
    license_author: 'wger.de',
    variations: [790],
  },
  {
    id: 234,
    uuid: '98765432-zyxw-vutr-sqpo-nmlkjihgfed',
    name: 'Plank',
    description: '<p>Get into a push-up position but rest on your forearms instead of your hands. Keep your body in a straight line from head to heels. Hold this position.</p>',
    category: 10,
    muscles: [9],
    muscles_secondary: [5, 8],
    equipment: [4],
    language: 2,
    license: 2,
    license_author: 'wger.de',
    variations: [],
  },
  {
    id: 567,
    uuid: 'abcdef12-3456-7890-abcd-ef1234567890',
    name: 'Shoulder Press',
    description: '<p>Stand or sit with dumbbells at shoulder height. Press the weights overhead until your arms are fully extended. Lower the weights back to shoulder height.</p>',
    category: 13,
    muscles: [5],
    muscles_secondary: [6],
    equipment: [3],
    language: 2,
    license: 2,
    license_author: 'wger.de',
    variations: [568],
  },
  {
    id: 890,
    uuid: 'fedcba09-8765-4321-fedc-ba0987654321',
    name: 'Deadlift',
    description: '<p>Stand with feet hip-width apart, barbell over mid-foot. Bend at hips and knees to grip the bar. Lift the bar by extending your hips and knees. Lower the bar back to the ground.</p>',
    category: 12,
    muscles: [2, 11],
    muscles_secondary: [7, 8],
    equipment: [1],
    language: 2,
    license: 2,
    license_author: 'wger.de',
    variations: [891, 892],
  },
  {
    id: 345,
    uuid: '11223344-5566-7788-99aa-bbccddeeff00',
    name: 'Leg Press',
    description: '<p>Sit in the leg press machine with your feet shoulder-width apart on the platform. Push the platform away by extending your legs. Return to the starting position with control.</p>',
    category: 9,
    muscles: [7],
    muscles_secondary: [8, 11],
    equipment: [1],
    language: 2,
    license: 2,
    license_author: 'wger.de',
    variations: [],
  },
  {
    id: 678,
    uuid: 'aabbccdd-eeff-0011-2233-445566778899',
    name: 'Crunches',
    description: '<p>Lie on your back with knees bent and feet flat on the floor. Place hands behind your head. Lift your shoulders off the ground by contracting your abs. Lower back down with control.</p>',
    category: 10,
    muscles: [9],
    muscles_secondary: [],
    equipment: [4],
    language: 2,
    license: 2,
    license_author: 'wger.de',
    variations: [679, 680],
  },
  {
    id: 901,
    uuid: '99887766-5544-3322-1100-ffeeddccbbaa',
    name: 'Calf Raises',
    description: '<p>Stand with the balls of your feet on an elevated surface. Lower your heels below the platform level. Push through the balls of your feet to raise your heels as high as possible.</p>',
    category: 11,
    muscles: [10],
    muscles_secondary: [],
    equipment: [10],
    language: 2,
    license: 2,
    license_author: 'wger.de',
    variations: [],
  },
];

/**
 * Sample workout sets
 */
export const mockSets: Set[] = [
  {
    id: 1,
    exercise: 88,
    sets: 4,
    reps: 8,
    weight: 80,
    order: 1,
    comment: 'Warm up first',
  },
  {
    id: 2,
    exercise: 456,
    sets: 3,
    reps: 10,
    weight: 0,
    order: 2,
    comment: 'Use assistance if needed',
  },
];

/**
 * Sample workout days
 */
export const mockDays: Day[] = [
  {
    id: 1,
    description: 'Upper Body',
    day: [1, 3, 5], // Monday, Wednesday, Friday
    sets: mockSets,
  },
];

/**
 * Sample workout routines
 */
export const mockWorkouts: Workout[] = [
  {
    id: 1,
    name: 'Push Day',
    description: 'Focus on chest, shoulders, and triceps',
    creation_date: '2024-01-15T10:30:00Z',
    days: mockDays,
  },
  {
    id: 2,
    name: 'Full Body Workout',
    description: 'Complete full body routine for beginners',
    creation_date: '2024-02-20T14:45:00Z',
    days: [
      {
        id: 3,
        description: 'Full Body',
        day: [1, 3, 5],
        sets: [
          {
            id: 5,
            exercise: 123,
            sets: 3,
            reps: 12,
            weight: 60,
            order: 1,
            comment: 'Start with lighter weight',
          },
          {
            id: 6,
            exercise: 88,
            sets: 3,
            reps: 10,
            weight: 70,
            order: 2,
            comment: '',
          },
        ],
      },
    ],
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

export const mockPaginatedWorkouts = createPaginatedResponse(mockWorkouts, mockWorkouts.length);

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
