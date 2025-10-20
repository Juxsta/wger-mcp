/**
 * Unit tests for search_exercises tool
 * Tests search with filters, pagination, validation, and error handling
 */

import { searchExercisesHandler } from '../../../src/tools/search-exercises';
import { wgerClient } from '../../../src/client/wger-client';
import { ValidationError } from '../../../src/utils/errors';
import { mockPaginatedExercises } from '../../fixtures/api-responses';

// Mock dependencies
jest.mock('../../../src/client/wger-client');

const mockedClient = wgerClient as jest.Mocked<typeof wgerClient>;

describe('search_exercises tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should search exercises with default parameters', async () => {
    mockedClient.get.mockResolvedValue(mockPaginatedExercises);

    const result = await searchExercisesHandler({});

    expect(result).toEqual(mockPaginatedExercises);
    expect(mockedClient.get).toHaveBeenCalledWith('/exercise/', {
      params: {
        limit: 20,
        offset: 0,
      },
    });
  });

  it('should search exercises with query parameter', async () => {
    mockedClient.get.mockResolvedValue(mockPaginatedExercises);

    await searchExercisesHandler({ query: 'bench' });

    expect(mockedClient.get).toHaveBeenCalledWith('/exercise/', {
      params: {
        limit: 20,
        offset: 0,
        search: 'bench',
      },
    });
  });

  it('should search exercises with all filters', async () => {
    mockedClient.get.mockResolvedValue(mockPaginatedExercises);

    await searchExercisesHandler({
      query: 'press',
      muscle: 4,
      equipment: 3,
      category: 14,
      limit: 10,
      offset: 5,
    });

    expect(mockedClient.get).toHaveBeenCalledWith('/exercise/', {
      params: {
        search: 'press',
        muscles: 4,
        equipment: 3,
        category: 14,
        limit: 10,
        offset: 5,
      },
    });
  });

  it('should handle pagination parameters', async () => {
    mockedClient.get.mockResolvedValue(mockPaginatedExercises);

    await searchExercisesHandler({ limit: 50, offset: 20 });

    expect(mockedClient.get).toHaveBeenCalledWith('/exercise/', {
      params: {
        limit: 50,
        offset: 20,
      },
    });
  });

  it('should throw ValidationError for invalid input', async () => {
    await expect(
      searchExercisesHandler({ limit: -5 })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for limit over maximum', async () => {
    await expect(
      searchExercisesHandler({ limit: 150 })
    ).rejects.toThrow(ValidationError);
  });
});
