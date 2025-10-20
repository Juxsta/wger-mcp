/**
 * Unit tests for get_exercise_details tool
 * Tests successful fetch, caching, 404 handling, and validation
 */

import { getExerciseDetailsHandler } from '../../../src/tools/get-exercise-details';
import { wgerClient } from '../../../src/client/wger-client';
import { cache } from '../../../src/client/cache';
import { NotFoundError, ValidationError } from '../../../src/utils/errors';
import { mockExercises } from '../../fixtures/api-responses';

// Mock dependencies
jest.mock('../../../src/client/wger-client');
jest.mock('../../../src/client/cache');

const mockedClient = wgerClient as jest.Mocked<typeof wgerClient>;
const mockedCache = cache as jest.Mocked<typeof cache>;

describe('get_exercise_details tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch exercise details successfully', async () => {
    const exercise = mockExercises[0];
    mockedCache.get.mockReturnValue(undefined);
    mockedClient.get.mockResolvedValue(exercise);

    const result = await getExerciseDetailsHandler({ exerciseId: 88 });

    expect(result).toEqual(exercise);
    expect(mockedClient.get).toHaveBeenCalledWith('/exercise/88/');
  });

  it('should cache exercise details after fetching', async () => {
    const exercise = mockExercises[0];
    mockedCache.get.mockReturnValue(undefined);
    mockedClient.get.mockResolvedValue(exercise);

    await getExerciseDetailsHandler({ exerciseId: 88 });

    expect(mockedCache.set).toHaveBeenCalledWith(
      'exercise:88',
      exercise,
      expect.any(Number)
    );
  });

  it('should return cached exercise when available', async () => {
    const exercise = mockExercises[0];
    mockedCache.get.mockReturnValue(exercise);

    const result = await getExerciseDetailsHandler({ exerciseId: 88 });

    expect(result).toEqual(exercise);
    expect(mockedClient.get).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError for non-existent exercise', async () => {
    mockedCache.get.mockReturnValue(undefined);
    mockedClient.get.mockRejectedValue(
      new NotFoundError('Exercise not found')
    );

    await expect(
      getExerciseDetailsHandler({ exerciseId: 9999 })
    ).rejects.toThrow(NotFoundError);
  });

  it('should throw ValidationError for invalid exerciseId', async () => {
    await expect(
      getExerciseDetailsHandler({ exerciseId: -1 })
    ).rejects.toThrow(ValidationError);
  });
});
