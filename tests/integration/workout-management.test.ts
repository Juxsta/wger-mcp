/**
 * Integration tests for workout management flow
 * Tests end-to-end authenticated workflows: authenticate → create workout → add exercises → get routines
 */

import { setupMSW } from '../setup/msw-setup';
import { createWorkoutHandler } from '../../src/tools/create-workout';
import { addExerciseToRoutineHandler } from '../../src/tools/add-exercise-to-routine';
import { getUserRoutinesHandler } from '../../src/tools/get-user-routines';
import { searchExercisesHandler } from '../../src/tools/search-exercises';
import { authManager } from '../../src/client/auth';
import { cache } from '../../src/client/cache';

// Setup MSW for API mocking
setupMSW();

describe('Workout Management Integration Tests', () => {
  beforeEach(() => {
    // Clear cache and auth before each test
    cache.clear();
    authManager.clearToken();

    // Set up test credentials
    process.env.WGER_API_KEY = 'test-api-key-12345';
  });

  afterEach(() => {
    // Clean up environment
    delete process.env.WGER_API_KEY;
    delete process.env.WGER_USERNAME;
    delete process.env.WGER_PASSWORD;
  });

  describe('Complete workout creation flow', () => {
    it('should allow user to create workout, add exercises, and retrieve routines', async () => {
      // Step 1: Create a new workout routine
      const workout = await createWorkoutHandler({
        name: 'Upper Body Day',
        description: 'Focus on chest, back, and shoulders',
      });

      expect(workout).toHaveProperty('id');
      expect(workout.name).toBe('Upper Body Day');
      expect(workout.description).toBe('Focus on chest, back, and shoulders');
      expect(workout).toHaveProperty('creation_date');

      // Step 2: Search for exercises to add
      const exercises = await searchExercisesHandler({
        query: 'bench',
      });
      expect(exercises.results.length).toBeGreaterThan(0);

      const benchPress = exercises.results.find((ex) =>
        ex.name.toLowerCase().includes('bench')
      );
      expect(benchPress).toBeDefined();

      // Step 3: Add exercise to the workout
      // Note: In real API, we'd need to create a day first, but for testing we use mock day ID
      const addedExercise = await addExerciseToRoutineHandler({
        workoutId: workout.id,
        dayId: 2001, // Mock day ID from fixtures
        exerciseId: benchPress!.id,
        sets: 4,
        reps: 8,
        weight: 80,
        order: 1,
        comment: 'Focus on form',
      });

      expect(addedExercise).toHaveProperty('id');
      expect(addedExercise.exercise).toBe(benchPress!.id);
      expect(addedExercise.sets).toBe(4);
      expect(addedExercise.reps).toBe(8);
      expect(addedExercise.weight).toBe(80);
      expect(addedExercise.comment).toBe('Focus on form');

      // Step 4: Retrieve all user routines
      const routines = await getUserRoutinesHandler({});
      expect(routines.results.length).toBeGreaterThan(0);
      expect(routines).toHaveProperty('count');

      // Verify routine structure includes nested data
      const firstRoutine = routines.results[0];
      expect(firstRoutine).toHaveProperty('id');
      expect(firstRoutine).toHaveProperty('name');
      expect(firstRoutine).toHaveProperty('days');
      expect(Array.isArray(firstRoutine.days)).toBe(true);

      if (firstRoutine.days.length > 0) {
        const firstDay = firstRoutine.days[0];
        expect(firstDay).toHaveProperty('sets');
        expect(Array.isArray(firstDay.sets)).toBe(true);
      }
    });

    it('should allow adding multiple exercises to a workout', async () => {
      // Create workout
      const workout = await createWorkoutHandler({
        name: 'Full Body Workout',
        description: 'Complete body workout',
      });

      // Add first exercise
      const exercise1 = await addExerciseToRoutineHandler({
        workoutId: workout.id,
        dayId: 2001,
        exerciseId: 123, // Squats
        sets: 4,
        reps: 10,
        order: 1,
      });
      expect(exercise1.exercise).toBe(123);
      expect(exercise1.order).toBe(1);

      // Add second exercise
      const exercise2 = await addExerciseToRoutineHandler({
        workoutId: workout.id,
        dayId: 2001,
        exerciseId: 88, // Bench press
        sets: 3,
        reps: 8,
        order: 2,
      });
      expect(exercise2.exercise).toBe(88);
      expect(exercise2.order).toBe(2);

      // Add third exercise
      const exercise3 = await addExerciseToRoutineHandler({
        workoutId: workout.id,
        dayId: 2001,
        exerciseId: 67, // Pull-ups
        sets: 3,
        reps: 12,
        order: 3,
      });
      expect(exercise3.exercise).toBe(67);
      expect(exercise3.order).toBe(3);
    });

    it('should support creating workout with minimal information', async () => {
      // Create workout with just a name
      const workout = await createWorkoutHandler({
        name: 'Quick Workout',
      });

      expect(workout.id).toBeDefined();
      expect(workout.name).toBe('Quick Workout');
      expect(workout.description).toBe('');
    });
  });

  describe('Authentication handling', () => {
    it('should authenticate with API key before creating workout', async () => {
      // Ensure token is not cached
      expect(authManager.hasCredentials()).toBe(true);

      // Creating workout should trigger authentication
      const workout = await createWorkoutHandler({
        name: 'Test Workout',
      });

      expect(workout).toBeDefined();
      expect(workout.id).toBeGreaterThan(0);
    });

    it('should authenticate with username and password', async () => {
      // Use username/password instead of API key
      delete process.env.WGER_API_KEY;
      process.env.WGER_USERNAME = 'testuser';
      process.env.WGER_PASSWORD = 'testpass123';

      const workout = await createWorkoutHandler({
        name: 'Test Workout',
      });

      expect(workout).toBeDefined();
    });

    it('should fail when no authentication credentials provided', async () => {
      // Remove all credentials
      delete process.env.WGER_API_KEY;
      delete process.env.WGER_USERNAME;
      delete process.env.WGER_PASSWORD;

      await expect(
        createWorkoutHandler({ name: 'Test' })
      ).rejects.toThrow();
    });

    it('should reuse cached authentication token across multiple calls', async () => {
      // First authenticated call
      await createWorkoutHandler({ name: 'Workout 1' });

      // Second authenticated call should reuse token
      await createWorkoutHandler({ name: 'Workout 2' });

      // Third authenticated call
      const routines = await getUserRoutinesHandler({});

      expect(routines).toBeDefined();
    });
  });

  describe('Input validation', () => {
    it('should validate workout name is required', async () => {
      await expect(
        createWorkoutHandler({ name: '' })
      ).rejects.toThrow();
    });

    it('should validate exercise parameters when adding to routine', async () => {
      // Invalid sets (too many)
      await expect(
        addExerciseToRoutineHandler({
          workoutId: 1,
          dayId: 1,
          exerciseId: 88,
          sets: 20, // Max is 10
        })
      ).rejects.toThrow();

      // Invalid reps (negative)
      await expect(
        addExerciseToRoutineHandler({
          workoutId: 1,
          dayId: 1,
          exerciseId: 88,
          sets: 3,
          reps: -5,
        })
      ).rejects.toThrow();

      // Invalid weight (negative)
      await expect(
        addExerciseToRoutineHandler({
          workoutId: 1,
          dayId: 1,
          exerciseId: 88,
          sets: 3,
          weight: -10,
        })
      ).rejects.toThrow();
    });

    it('should accept optional parameters with defaults', async () => {
      const result = await addExerciseToRoutineHandler({
        workoutId: 1001,
        dayId: 2001,
        exerciseId: 88,
        sets: 3,
        // reps, weight, order, comment are optional
      });

      expect(result.sets).toBe(3);
      expect(result.exercise).toBe(88);
    });
  });

  describe('Pagination support', () => {
    it('should support pagination when retrieving routines', async () => {
      // Get first page with limit
      const page1 = await getUserRoutinesHandler({
        limit: 1,
        offset: 0,
      });

      expect(page1.results.length).toBeLessThanOrEqual(1);
      expect(page1.count).toBeGreaterThanOrEqual(1);

      // Get second page
      if (page1.count > 1) {
        const page2 = await getUserRoutinesHandler({
          limit: 1,
          offset: 1,
        });

        expect(page2.results.length).toBeLessThanOrEqual(1);
        expect(page2.count).toBe(page1.count);

        // Different routines on different pages
        if (page2.results.length > 0) {
          expect(page2.results[0].id).not.toBe(page1.results[0].id);
        }
      }
    });

    it('should respect default limit for routines', async () => {
      const routines = await getUserRoutinesHandler({});

      expect(routines.results.length).toBeLessThanOrEqual(20); // Default limit
    });
  });

  describe('Error scenarios', () => {
    it('should handle workout name too long', async () => {
      const longName = 'A'.repeat(101); // Max is 100

      await expect(
        createWorkoutHandler({ name: longName })
      ).rejects.toThrow();
    });

    it('should handle description too long', async () => {
      const longDescription = 'A'.repeat(501); // Max is 500

      await expect(
        createWorkoutHandler({
          name: 'Test',
          description: longDescription,
        })
      ).rejects.toThrow();
    });

    it('should handle comment too long when adding exercise', async () => {
      const longComment = 'A'.repeat(201); // Max is 200

      await expect(
        addExerciseToRoutineHandler({
          workoutId: 1,
          dayId: 1,
          exerciseId: 88,
          sets: 3,
          comment: longComment,
        })
      ).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      await expect(
        addExerciseToRoutineHandler({
          workoutId: 1,
          dayId: 1,
          exerciseId: 88,
          // sets is required
        } as any)
      ).rejects.toThrow();
    });
  });

  describe('Data consistency', () => {
    it('should preserve workout metadata after creation', async () => {
      const workoutData = {
        name: 'Consistency Test Workout',
        description: 'Testing data integrity',
      };

      const created = await createWorkoutHandler(workoutData);

      expect(created.name).toBe(workoutData.name);
      expect(created.description).toBe(workoutData.description);
      expect(created).toHaveProperty('id');
      expect(created).toHaveProperty('creation_date');
    });

    it('should preserve exercise parameters when added to routine', async () => {
      const exerciseData = {
        workoutId: 1001,
        dayId: 2001,
        exerciseId: 88,
        sets: 4,
        reps: 10,
        weight: 100,
        order: 2,
        comment: 'Test comment',
      };

      const added = await addExerciseToRoutineHandler(exerciseData);

      expect(added.exercise).toBe(exerciseData.exerciseId);
      expect(added.sets).toBe(exerciseData.sets);
      expect(added.reps).toBe(exerciseData.reps);
      expect(added.weight).toBe(exerciseData.weight);
      expect(added.order).toBe(exerciseData.order);
      expect(added.comment).toBe(exerciseData.comment);
    });
  });
});
