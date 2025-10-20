/**
 * MSW (Mock Service Worker) setup for integration tests
 * Mocks wger API endpoints with realistic responses and network delays
 */

import { http, HttpResponse, delay } from 'msw';
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
  http.post(`${BASE_URL}/token`, async () => {
    await delay(getNetworkDelay());
    return HttpResponse.json(mockAuthResponses.success);
  }),

  // Token refresh endpoint - POST /api/v2/token/refresh
  http.post(`${BASE_URL}/token/refresh`, async () => {
    await delay(getNetworkDelay());
    return HttpResponse.json(mockAuthResponses.refreshSuccess);
  }),

  // List categories - GET /api/v2/exercisecategory/
  http.get(`${BASE_URL}/exercisecategory/`, async () => {
    await delay(getNetworkDelay());
    return HttpResponse.json(mockPaginatedCategories);
  }),

  // List muscles - GET /api/v2/muscle/
  http.get(`${BASE_URL}/muscle/`, async () => {
    await delay(getNetworkDelay());
    return HttpResponse.json(mockPaginatedMuscles);
  }),

  // List equipment - GET /api/v2/equipment/
  http.get(`${BASE_URL}/equipment/`, async () => {
    await delay(getNetworkDelay());
    return HttpResponse.json(mockPaginatedEquipment);
  }),

  // Search exercises - GET /api/v2/exercise/
  http.get(`${BASE_URL}/exercise/`, async ({ request }) => {
    await delay(getNetworkDelay());

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search');
    const muscle = url.searchParams.get('muscles');
    const equipment = url.searchParams.get('equipment');
    const category = url.searchParams.get('category');

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

    return HttpResponse.json({
      count: filteredExercises.length,
      next: hasNext ? `${BASE_URL}/exercise/?limit=${limit}&offset=${offset + limit}` : null,
      previous: hasPrevious
        ? `${BASE_URL}/exercise/?limit=${limit}&offset=${Math.max(0, offset - limit)}`
        : null,
      results: paginatedResults,
    });
  }),

  // Get exercise details - GET /api/v2/exercise/:id/
  http.get(`${BASE_URL}/exercise/:id/`, async ({ params }) => {
    await delay(getNetworkDelay());

    const exerciseId = parseInt(params.id as string);
    const exercise = mockExercises.find((ex) => ex.id === exerciseId);

    if (!exercise) {
      return new HttpResponse(JSON.stringify(mockErrorResponses.notFound), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return HttpResponse.json(exercise);
  }),

  // List user workouts - GET /api/v2/workout/
  http.get(`${BASE_URL}/workout/`, async ({ request }) => {
    await delay(getNetworkDelay());

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(JSON.stringify(mockErrorResponses.unauthorized), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const paginatedResults = mockPaginatedWorkouts.results.slice(offset, offset + limit);

    return HttpResponse.json({
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
    });
  }),

  // Create workout - POST /api/v2/workout/
  http.post(`${BASE_URL}/workout/`, async ({ request }) => {
    await delay(getNetworkDelay());

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(JSON.stringify(mockErrorResponses.unauthorized), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = (await request.json()) as { name?: string; description?: string };

    if (!body.name) {
      return new HttpResponse(JSON.stringify(mockErrorResponses.validationError), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return HttpResponse.json({
      id: 1003,
      name: body.name,
      description: body.description || '',
      creation_date: new Date().toISOString(),
      days: [],
    });
  }),

  // Add exercise to routine - POST /api/v2/set/
  http.post(`${BASE_URL}/set/`, async ({ request }) => {
    await delay(getNetworkDelay());

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(JSON.stringify(mockErrorResponses.unauthorized), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = (await request.json()) as {
      exerciseset?: number;
      exercise?: number;
      sets?: number;
      reps?: number;
      weight?: number;
      order?: number;
      comment?: string;
    };

    if (!body.exerciseset || !body.exercise || !body.sets) {
      return new HttpResponse(JSON.stringify(mockErrorResponses.validationError), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return HttpResponse.json({
      id: 3010,
      exercise: body.exercise,
      sets: body.sets,
      reps: body.reps || 0,
      weight: body.weight || 0,
      order: body.order || 1,
      comment: body.comment || '',
    });
  }),
];

/**
 * Error simulation handlers
 * These can be used in specific tests to simulate error conditions
 */
export const errorHandlers = {
  // Simulate 401 Unauthorized errors
  unauthorized: [
    http.get(`${BASE_URL}/workout/`, async () => {
      await delay(getNetworkDelay());
      return new HttpResponse(JSON.stringify(mockErrorResponses.unauthorized), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  ],

  // Simulate 404 Not Found errors
  notFound: [
    http.get(`${BASE_URL}/exercise/:id/`, async () => {
      await delay(getNetworkDelay());
      return new HttpResponse(JSON.stringify(mockErrorResponses.notFound), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  ],

  // Simulate 429 Rate Limit errors
  rateLimit: [
    http.get(`${BASE_URL}/exercise/`, async () => {
      await delay(getNetworkDelay());
      return new HttpResponse(JSON.stringify(mockErrorResponses.rateLimited), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  ],

  // Simulate 500 Server errors
  serverError: [
    http.get(`${BASE_URL}/exercise/`, async () => {
      await delay(getNetworkDelay());
      return new HttpResponse(JSON.stringify(mockErrorResponses.serverError), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  ],

  // Simulate network timeout/connection errors
  networkError: [
    http.get(`${BASE_URL}/exercise/`, async () => {
      await delay(getNetworkDelay());
      return HttpResponse.error();
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
