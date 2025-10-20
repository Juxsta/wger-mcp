/**
 * Unit tests for get_user_routines tool
 * Tests successful fetch, authentication, pagination, and error handling
 */

import { getUserRoutinesHandler } from '../../../src/tools/get-user-routines';
import { wgerClient } from '../../../src/client/wger-client';
import { authManager } from '../../../src/client/auth';
import { ValidationError } from '../../../src/utils/errors';
import { mockPaginatedWorkouts } from '../../fixtures/api-responses';

// Mock dependencies
jest.mock('../../../src/client/wger-client');
jest.mock('../../../src/client/auth');

const mockedClient = wgerClient as jest.Mocked<typeof wgerClient>;
const mockedAuth = authManager as jest.Mocked<typeof authManager>;

describe('get_user_routines tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.hasCredentials.mockReturnValue(true);
  });

  it('should fetch user routines with default parameters', async () => {
    mockedClient.get.mockResolvedValue(mockPaginatedWorkouts);

    const result = await getUserRoutinesHandler({});

    expect(result).toEqual(mockPaginatedWorkouts);
    expect(mockedClient.get).toHaveBeenCalledWith('/workout/', {
      params: {
        limit: 20,
        offset: 0,
      },
    });
  });

  it('should fetch user routines with pagination', async () => {
    mockedClient.get.mockResolvedValue(mockPaginatedWorkouts);

    await getUserRoutinesHandler({ limit: 10, offset: 5 });

    expect(mockedClient.get).toHaveBeenCalledWith('/workout/', {
      params: {
        limit: 10,
        offset: 5,
      },
    });
  });

  it('should throw ValidationError for invalid limit', async () => {
    await expect(
      getUserRoutinesHandler({ limit: 0 })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for limit over maximum', async () => {
    await expect(
      getUserRoutinesHandler({ limit: 100 })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for negative offset', async () => {
    await expect(
      getUserRoutinesHandler({ offset: -1 })
    ).rejects.toThrow(ValidationError);
  });
});
