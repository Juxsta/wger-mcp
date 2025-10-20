/**
 * MSW (Mock Service Worker) setup for integration tests
 * Mocks wger API endpoints with realistic responses and network delays
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  mockExercises,
  mockPaginatedCategories,
  mockPaginatedMuscles,
  mockPaginatedEquipment,
  mockPaginatedWorkouts,
  mockAuthResponses,
  mockErrorResponses,
} from '../fixtures/api-responses';

const BASE_URL = 'https://wger.de/api/v2';

/**
 * Generate a realistic network delay (50-200ms)
 */
function getNetworkDelay(): number {
  return Math.floor(Math.random() * 150) + 50;
}

/**
 * MSW HTTP handlers for wger API endpoints
 */
export const handlers = [
  // Authentication endpoint - POST /api/v2/token
  rest.post(`${BASE_URL}/token`, (_req, res, ctx) => {
    return res(ctx.delay(getNetworkDelay()), ctx.json(mockAuthResponses.success));
  }),

  // Token refresh endpoint - POST /api/v2/token/refresh
  rest.post(`${BASE_URL}/token/refresh`, (_req, res, ctx) => {
    return res(ctx.delay(getNetworkDelay()), ctx.json(mockAuthResponses.refreshSuccess));
  }),

  // List categories - GET /api/v2/exercisecategory/
  rest.get(`${BASE_URL}/exercisecategory/`, (_req, res, ctx) => {
    return res(ctx.delay(getNetworkDelay()), ctx.json(mockPaginatedCategories));
  }),

  // List muscles - GET /api/v2/muscle/
  rest.get(`${BASE_URL}/muscle/`, (_req, res, ctx) => {
    return res(ctx.delay(getNetworkDelay()), ctx.json(mockPaginatedMuscles));
  }),

  // List equipment - GET /api/v2/equipment/
  rest.get(`${BASE_URL}/equipment/`, (_req, res, ctx) => {
    return res(ctx.delay(getNetworkDelay()), ctx.json(mockPaginatedEquipment));
  }),

  // Search exercises - GET /api/v2/exercise/
  rest.get(`${BASE_URL}/exercise/`, (req, res, ctx) => {
    const limit = parseInt(req.url.searchParams.get('limit') || '20');
    const offset = parseInt(req.url.searchParams.get('offset') || '0');
    const search = req.url.searchParams.get('search');
    const muscle = req.url.searchParams.get('muscles');
    const equipment = req.url.searchParams.get('equipment');
    const category = req.url.searchParams.get('category');

    // Filter exercises based on query parameters
    let filteredExercises = [...mockExercises];

    if (search) {
      filteredExercises = filteredExercises.filter((ex) =>
        ex.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (muscle) {
      const muscleId = parseInt(muscle);
      filteredExercises = filteredExercises.filter(
        (ex) => ex.muscles.includes(muscleId) || ex.muscles_secondary.includes(muscleId)
      );
    }

    if (equipment) {
      const equipmentId = parseInt(equipment);
      filteredExercises = filteredExercises.filter((ex) => ex.equipment.includes(equipmentId));
    }

    if (category) {
      const categoryId = parseInt(category);
      filteredExercises = filteredExercises.filter((ex) => ex.category === categoryId);
    }

    // Paginate results
    const paginatedResults = filteredExercises.slice(offset, offset + limit);
    const hasNext = offset + limit < filteredExercises.length;
    const hasPrevious = offset > 0;

    return res(
      ctx.delay(getNetworkDelay()),
      ctx.json({
        count: filteredExercises.length,
        next: hasNext ? `${BASE_URL}/exercise/?limit=${limit}&offset=${offset + limit}` : null,
        previous: hasPrevious
          ? `${BASE_URL}/exercise/?limit=${limit}&offset=${Math.max(0, offset - limit)}`
          : null,
        results: paginatedResults,
      })
    );
  }),

  // Get exercise details - GET /api/v2/exercise/:id/
  rest.get(`${BASE_URL}/exercise/:id/`, (req, res, ctx) => {
    const exerciseId = parseInt(req.params.id as string);
    const exercise = mockExercises.find((ex) => ex.id === exerciseId);

    if (!exercise) {
      return res(
        ctx.delay(getNetworkDelay()),
        ctx.status(404),
        ctx.json(mockErrorResponses.notFound)
      );
    }

    return res(ctx.delay(getNetworkDelay()), ctx.json(exercise));
  }),

  // List user workouts - GET /api/v2/workout/
  rest.get(`${BASE_URL}/workout/`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.delay(getNetworkDelay()),
        ctx.status(401),
        ctx.json(mockErrorResponses.unauthorized)
      );
    }

    const limit = parseInt(req.url.searchParams.get('limit') || '20');
    const offset = parseInt(req.url.searchParams.get('offset') || '0');

    const paginatedResults = mockPaginatedWorkouts.results.slice(offset, offset + limit);

    return res(
      ctx.delay(getNetworkDelay()),
      ctx.json({
        count: mockPaginatedWorkouts.count,
        next:
          offset + limit < mockPaginatedWorkouts.count
            ? `${BASE_URL}/workout/?limit=${limit}&offset=${offset + limit}`
            : null,
        previous:
          offset > 0
            ? `${BASE_URL}/workout/?limit=${limit}&offset=${Math.max(0, offset - limit)}`
            : null,
        results: paginatedResults,
      })
    );
  }),

  // Create workout - POST /api/v2/workout/
  rest.post(`${BASE_URL}/workout/`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.delay(getNetworkDelay()),
        ctx.status(401),
        ctx.json(mockErrorResponses.unauthorized)
      );
    }

    const body = req.body as { name?: string; description?: string };

    if (!body.name) {
      return res(
        ctx.delay(getNetworkDelay()),
        ctx.status(400),
        ctx.json(mockErrorResponses.validationError)
      );
    }

    return res(
      ctx.delay(getNetworkDelay()),
      ctx.json({
        id: 1003,
        name: body.name,
        description: body.description || '',
        creation_date: new Date().toISOString(),
        days: [],
      })
    );
  }),

  // Add exercise to routine - POST /api/v2/set/
  rest.post(`${BASE_URL}/set/`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.delay(getNetworkDelay()),
        ctx.status(401),
        ctx.json(mockErrorResponses.unauthorized)
      );
    }

    const body = req.body as {
      exerciseset?: number;
      exercise?: number;
      sets?: number;
      reps?: number;
      weight?: number;
      order?: number;
      comment?: string;
    };

    if (!body.exerciseset || !body.exercise || !body.sets) {
      return res(
        ctx.delay(getNetworkDelay()),
        ctx.status(400),
        ctx.json(mockErrorResponses.validationError)
      );
    }

    return res(
      ctx.delay(getNetworkDelay()),
      ctx.json({
        id: 3010,
        exercise: body.exercise,
        sets: body.sets,
        reps: body.reps || 0,
        weight: body.weight || 0,
        order: body.order || 1,
        comment: body.comment || '',
      })
    );
  }),
];

/**
 * Error simulation handlers
 * These can be used in specific tests to simulate error conditions
 */
export const errorHandlers = {
  // Simulate 401 Unauthorized errors
  unauthorized: [
    rest.get(`${BASE_URL}/workout/`, (_req, res, ctx) => {
      return res(
        ctx.delay(getNetworkDelay()),
        ctx.status(401),
        ctx.json(mockErrorResponses.unauthorized)
      );
    }),
  ],

  // Simulate 404 Not Found errors
  notFound: [
    rest.get(`${BASE_URL}/exercise/:id/`, (_req, res, ctx) => {
      return res(
        ctx.delay(getNetworkDelay()),
        ctx.status(404),
        ctx.json(mockErrorResponses.notFound)
      );
    }),
  ],

  // Simulate 429 Rate Limit errors
  rateLimit: [
    rest.get(`${BASE_URL}/exercise/`, (_req, res, ctx) => {
      return res(
        ctx.delay(getNetworkDelay()),
        ctx.status(429),
        ctx.json(mockErrorResponses.rateLimited)
      );
    }),
  ],

  // Simulate 500 Server errors
  serverError: [
    rest.get(`${BASE_URL}/exercise/`, (_req, res, ctx) => {
      return res(
        ctx.delay(getNetworkDelay()),
        ctx.status(500),
        ctx.json(mockErrorResponses.serverError)
      );
    }),
  ],

  // Simulate network timeout/connection errors
  networkError: [
    rest.get(`${BASE_URL}/exercise/`, (_req, res, _ctx) => {
      return res.networkError('Network connection failed');
    }),
  ],
};

/**
 * Create and configure MSW server for Node.js tests
 */
export const server = setupServer(...handlers);

/**
 * Setup function to be called in test setup
 * Starts the server before all tests
 */
export function setupMSW(): void {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
}
