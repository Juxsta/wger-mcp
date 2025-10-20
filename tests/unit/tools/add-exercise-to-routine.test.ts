/**
 * Unit tests for add_exercise_to_routine tool
 * Tests successful addition, authentication, validation, and error handling
 */

import { addExerciseToRoutineHandler } from '../../../src/tools/add-exercise-to-routine';
import { wgerClient } from '../../../src/client/wger-client';
import { authManager } from '../../../src/client/auth';
import { ValidationError } from '../../../src/utils/errors';
import { mockSets } from '../../fixtures/api-responses';

// Mock dependencies
jest.mock('../../../src/client/wger-client');
jest.mock('../../../src/client/auth');

const mockedClient = wgerClient as jest.Mocked<typeof wgerClient>;
const mockedAuth = authManager as jest.Mocked<typeof authManager>;

describe('add_exercise_to_routine tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.hasCredentials.mockReturnValue(true);
  });

  it('should add exercise to routine successfully', async () => {
    const set = mockSets[0];
    mockedClient.post.mockResolvedValue(set);

    const result = await addExerciseToRoutineHandler({
      workoutId: 1,
      dayId: 1,
      exerciseId: 88,
      sets: 4,
      reps: 8,
      weight: 80,
      order: 1,
      comment: 'Test comment',
    });

    expect(result).toEqual(set);
    expect(mockedClient.post).toHaveBeenCalledWith('/set/', {
      workout: 1,
      day: 1,
      exerciseset: 88,
      sets: 4,
      reps: 8,
      weight: 80,
      order: 1,
      comment: 'Test comment',
    });
  });

  it('should add exercise with minimal parameters', async () => {
    const set = mockSets[0];
    mockedClient.post.mockResolvedValue(set);

    await addExerciseToRoutineHandler({
      workoutId: 1,
      dayId: 1,
      exerciseId: 88,
      sets: 3,
    });

    expect(mockedClient.post).toHaveBeenCalledWith('/set/', {
      workout: 1,
      day: 1,
      exerciseset: 88,
      sets: 3,
    });
  });

  it('should throw ValidationError for invalid sets', async () => {
    await expect(
      addExerciseToRoutineHandler({
        workoutId: 1,
        dayId: 1,
        exerciseId: 88,
        sets: 0,
      })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for sets too high', async () => {
    await expect(
      addExerciseToRoutineHandler({
        workoutId: 1,
        dayId: 1,
        exerciseId: 88,
        sets: 15,
      })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for invalid reps', async () => {
    await expect(
      addExerciseToRoutineHandler({
        workoutId: 1,
        dayId: 1,
        exerciseId: 88,
        sets: 3,
        reps: 0,
      })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for negative weight', async () => {
    await expect(
      addExerciseToRoutineHandler({
        workoutId: 1,
        dayId: 1,
        exerciseId: 88,
        sets: 3,
        weight: -10,
      })
    ).rejects.toThrow(ValidationError);
  });
});
