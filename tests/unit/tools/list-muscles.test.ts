/**
 * Unit tests for list_muscles tool
 * Tests successful fetch, caching, and error handling
 */

import { listMusclesHandler } from '../../../src/tools/list-muscles';
import { wgerClient } from '../../../src/client/wger-client';
import { cache } from '../../../src/client/cache';
import { mockPaginatedMuscles } from '../../fixtures/api-responses';

// Mock dependencies
jest.mock('../../../src/client/wger-client');
jest.mock('../../../src/client/cache');

const mockedClient = wgerClient as jest.Mocked<typeof wgerClient>;
const mockedCache = cache as jest.Mocked<typeof cache>;

describe('list_muscles tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch muscles successfully', async () => {
    mockedCache.get.mockReturnValue(undefined);
    mockedClient.get.mockResolvedValue(mockPaginatedMuscles);

    const result = await listMusclesHandler();

    expect(result.results).toEqual(mockPaginatedMuscles.results);
    expect(mockedClient.get).toHaveBeenCalledWith('/muscle/');
  });

  it('should cache muscles after fetching', async () => {
    mockedCache.get.mockReturnValue(undefined);
    mockedClient.get.mockResolvedValue(mockPaginatedMuscles);

    await listMusclesHandler();

    expect(mockedCache.set).toHaveBeenCalledWith(
      'muscles:all',
      expect.objectContaining({ results: mockPaginatedMuscles.results }),
      expect.any(Number)
    );
  });

  it('should return cached muscles when available', async () => {
    const cachedData = { results: mockPaginatedMuscles.results };
    mockedCache.get.mockReturnValue(cachedData);

    const result = await listMusclesHandler();

    expect(result).toEqual(cachedData);
    expect(mockedClient.get).not.toHaveBeenCalled();
  });
});
