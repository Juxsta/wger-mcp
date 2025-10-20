/**
 * Unit tests for list_categories tool
 * Tests successful fetch, caching, and error handling
 */

import { listCategoriesHandler } from '../../../src/tools/list-categories';
import { wgerClient } from '../../../src/client/wger-client';
import { cache } from '../../../src/client/cache';
import { mockPaginatedCategories } from '../../fixtures/api-responses';

// Mock dependencies
jest.mock('../../../src/client/wger-client');
jest.mock('../../../src/client/cache');

const mockedClient = wgerClient as jest.Mocked<typeof wgerClient>;
const mockedCache = cache as jest.Mocked<typeof cache>;

describe('list_categories tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch categories successfully', async () => {
    mockedCache.get.mockReturnValue(undefined);
    mockedClient.get.mockResolvedValue(mockPaginatedCategories);

    const result = await listCategoriesHandler();

    expect(result.results).toEqual(mockPaginatedCategories.results);
    expect(mockedClient.get).toHaveBeenCalledWith('/exercisecategory/');
  });

  it('should cache categories after fetching', async () => {
    mockedCache.get.mockReturnValue(undefined);
    mockedClient.get.mockResolvedValue(mockPaginatedCategories);

    await listCategoriesHandler();

    expect(mockedCache.set).toHaveBeenCalledWith(
      'categories:all',
      expect.objectContaining({ results: mockPaginatedCategories.results }),
      expect.any(Number)
    );
  });

  it('should return cached categories when available', async () => {
    const cachedData = { results: mockPaginatedCategories.results };
    mockedCache.get.mockReturnValue(cachedData);

    const result = await listCategoriesHandler();

    expect(result).toEqual(cachedData);
    expect(mockedClient.get).not.toHaveBeenCalled();
  });
});
