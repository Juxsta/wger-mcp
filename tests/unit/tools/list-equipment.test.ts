/**
 * Unit tests for list_equipment tool
 * Tests successful fetch, caching, and error handling
 */

import { listEquipmentHandler } from '../../../src/tools/list-equipment';
import { wgerClient } from '../../../src/client/wger-client';
import { cache } from '../../../src/client/cache';
import { mockPaginatedEquipment } from '../../fixtures/api-responses';

// Mock dependencies
jest.mock('../../../src/client/wger-client');
jest.mock('../../../src/client/cache');

const mockedClient = wgerClient as jest.Mocked<typeof wgerClient>;
const mockedCache = cache as jest.Mocked<typeof cache>;

describe('list_equipment tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch equipment successfully', async () => {
    mockedCache.get.mockReturnValue(undefined);
    mockedClient.get.mockResolvedValue(mockPaginatedEquipment);

    const result = await listEquipmentHandler();

    expect(result.results).toEqual(mockPaginatedEquipment.results);
    expect(mockedClient.get).toHaveBeenCalledWith('/equipment/');
  });

  it('should cache equipment after fetching', async () => {
    mockedCache.get.mockReturnValue(undefined);
    mockedClient.get.mockResolvedValue(mockPaginatedEquipment);

    await listEquipmentHandler();

    expect(mockedCache.set).toHaveBeenCalledWith(
      'equipment:all',
      expect.objectContaining({ results: mockPaginatedEquipment.results }),
      expect.any(Number)
    );
  });

  it('should return cached equipment when available', async () => {
    const cachedData = { results: mockPaginatedEquipment.results };
    mockedCache.get.mockReturnValue(cachedData);

    const result = await listEquipmentHandler();

    expect(result).toEqual(cachedData);
    expect(mockedClient.get).not.toHaveBeenCalled();
  });
});
