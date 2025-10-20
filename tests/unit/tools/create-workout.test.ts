/**
 * Unit tests for create_workout tool
 * Tests successful creation, authentication, validation, and error handling
 */

import { createWorkoutHandler } from '../../../src/tools/create-workout';
import { wgerClient } from '../../../src/client/wger-client';
import { authManager } from '../../../src/client/auth';
import { ValidationError } from '../../../src/utils/errors';
import { mockWorkouts } from '../../fixtures/api-responses';

// Mock dependencies
jest.mock('../../../src/client/wger-client');
jest.mock('../../../src/client/auth');

const mockedClient = wgerClient as jest.Mocked<typeof wgerClient>;
const mockedAuth = authManager as jest.Mocked<typeof authManager>;

describe('create_workout tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuth.hasCredentials.mockReturnValue(true);
    mockedAuth.getToken.mockResolvedValue('mock-token');
  });

  it('should create workout successfully', async () => {
    const workout = mockWorkouts[0];
    mockedClient.post.mockResolvedValue(workout);

    const result = await createWorkoutHandler({
      name: 'Test Workout',
      description: 'Test description',
    });

    expect(result).toEqual(workout);
    expect(mockedClient.post).toHaveBeenCalledWith('/workout/', {
      name: 'Test Workout',
      description: 'Test description',
    });
  });

  it('should create workout without description', async () => {
    const workout = mockWorkouts[0];
    mockedClient.post.mockResolvedValue(workout);

    await createWorkoutHandler({ name: 'Test Workout' });

    expect(mockedClient.post).toHaveBeenCalledWith('/workout/', {
      name: 'Test Workout',
      description: '',
    });
  });

  it('should throw ValidationError for missing name', async () => {
    await expect(
      createWorkoutHandler({ name: '' })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for name too long', async () => {
    await expect(
      createWorkoutHandler({ name: 'a'.repeat(101) })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError for description too long', async () => {
    await expect(
      createWorkoutHandler({
        name: 'Test',
        description: 'a'.repeat(501),
      })
    ).rejects.toThrow(ValidationError);
  });
});
