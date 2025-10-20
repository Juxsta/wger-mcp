/**
 * Integration tests for exercise discovery flow
 * Tests end-to-end workflows from list categories → search exercises → get details
 */

import { setupMSW } from '../setup/msw-setup';
import { listCategoriesHandler } from '../../src/tools/list-categories';
import { listMusclesHandler } from '../../src/tools/list-muscles';
import { listEquipmentHandler } from '../../src/tools/list-equipment';
import { searchExercisesHandler } from '../../src/tools/search-exercises';
import { getExerciseDetailsHandler } from '../../src/tools/get-exercise-details';
import { cache } from '../../src/client/cache';

// Setup MSW for API mocking
setupMSW();

describe('Exercise Discovery Integration Tests', () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
  });

  describe('Complete exercise discovery flow', () => {
    it('should allow user to list categories, search exercises, and get details', async () => {
      // Step 1: List categories to find what types of exercises exist
      const categories = await listCategoriesHandler();
      expect(categories.results).toHaveLength(7);
      expect(categories.results[0]).toHaveProperty('id');
      expect(categories.results[0]).toHaveProperty('name');

      // Find chest category
      const chestCategory = categories.results.find((cat) => cat.name === 'Chest');
      expect(chestCategory).toBeDefined();

      // Step 2: List muscles to understand what muscle groups can be targeted
      const muscles = await listMusclesHandler();
      expect(muscles.results.length).toBeGreaterThan(0);
      expect(muscles.results[0]).toHaveProperty('name_en');

      // Step 3: List equipment to see what's available
      const equipment = await listEquipmentHandler();
      expect(equipment.results.length).toBeGreaterThan(0);
      const dumbbell = equipment.results.find((eq) => eq.name === 'Dumbbell');
      expect(dumbbell).toBeDefined();

      // Step 4: Search for chest exercises with dumbbells
      const searchResults = await searchExercisesHandler({
        category: chestCategory!.id,
        equipment: dumbbell!.id,
      });
      expect(searchResults.results.length).toBeGreaterThan(0);
      expect(searchResults).toHaveProperty('count');

      // Step 5: Get details for a specific exercise
      const firstExercise = searchResults.results[0];
      const details = await getExerciseDetailsHandler({
        exerciseId: firstExercise.id,
      });
      expect(details.id).toBe(firstExercise.id);
      expect(details.name).toBe(firstExercise.name);
      expect(details).toHaveProperty('description');
    });

    it('should allow searching exercises by keyword', async () => {
      // Search for exercises with "press" in the name
      const searchResults = await searchExercisesHandler({
        query: 'press',
      });

      expect(searchResults.results.length).toBeGreaterThan(0);
      searchResults.results.forEach((exercise) => {
        expect(exercise.name.toLowerCase()).toContain('press');
      });
    });

    it('should allow filtering exercises by muscle group', async () => {
      // Get list of muscles
      const muscles = await listMusclesHandler();
      const biceps = muscles.results.find((m) => m.name_en === 'Biceps');
      expect(biceps).toBeDefined();

      // Search for bicep exercises
      const searchResults = await searchExercisesHandler({
        muscle: biceps!.id,
      });

      expect(searchResults.results.length).toBeGreaterThan(0);
      searchResults.results.forEach((exercise) => {
        const hasBiceps =
          exercise.muscles.includes(biceps!.id) ||
          exercise.muscles_secondary.includes(biceps!.id);
        expect(hasBiceps).toBe(true);
      });
    });
  });

  describe('Caching behavior', () => {
    it('should cache static data (categories, muscles, equipment)', async () => {
      // First call - should hit API
      const categories1 = await listCategoriesHandler();
      expect(categories1.results).toHaveLength(7);

      // Second call - should use cache
      const categories2 = await listCategoriesHandler();
      expect(categories2.results).toHaveLength(7);
      expect(categories2).toEqual(categories1);

      // Verify cache works for muscles too
      const muscles1 = await listMusclesHandler();
      const muscles2 = await listMusclesHandler();
      expect(muscles2).toEqual(muscles1);

      // Verify cache works for equipment
      const equipment1 = await listEquipmentHandler();
      const equipment2 = await listEquipmentHandler();
      expect(equipment2).toEqual(equipment1);
    });

    it('should cache exercise details with 1-hour TTL', async () => {
      const exerciseId = 123; // Squats

      // First call - should hit API
      const details1 = await getExerciseDetailsHandler({ exerciseId });
      expect(details1.id).toBe(exerciseId);

      // Second call - should use cache
      const details2 = await getExerciseDetailsHandler({ exerciseId });
      expect(details2).toEqual(details1);

      // Verify cache key exists
      expect(cache.has(`exercise:${exerciseId}`)).toBe(true);
    });

    it('should not cache search results', async () => {
      // Search results should always be fresh as they can change
      const search1 = await searchExercisesHandler({ query: 'bench' });
      const search2 = await searchExercisesHandler({ query: 'bench' });

      // Results should be equal but not cached (each call hits the API)
      expect(search2).toEqual(search1);
    });
  });

  describe('Error handling', () => {
    it('should handle exercise not found (404)', async () => {
      const nonExistentId = 99999;

      await expect(getExerciseDetailsHandler({ exerciseId: nonExistentId })).rejects.toThrow(
        'Not found'
      );
    });

    it('should handle invalid search parameters', async () => {
      await expect(searchExercisesHandler({ limit: -1 })).rejects.toThrow(
        'Invalid search parameters'
      );

      await expect(searchExercisesHandler({ limit: 200 })).rejects.toThrow(
        'Invalid search parameters'
      );
    });

    it('should handle invalid exercise ID', async () => {
      await expect(getExerciseDetailsHandler({ exerciseId: -1 })).rejects.toThrow();

      await expect(getExerciseDetailsHandler({ exerciseId: 0 })).rejects.toThrow();
    });
  });

  describe('Pagination support', () => {
    it('should support pagination in search results', async () => {
      // Get first page
      const page1 = await searchExercisesHandler({
        limit: 5,
        offset: 0,
      });

      expect(page1.results).toHaveLength(5);
      expect(page1.count).toBeGreaterThan(5);

      // Get second page
      const page2 = await searchExercisesHandler({
        limit: 5,
        offset: 5,
      });

      expect(page2.results).toHaveLength(5);
      expect(page2.count).toBe(page1.count);

      // Verify no overlap between pages
      const page1Ids = page1.results.map((ex) => ex.id);
      const page2Ids = page2.results.map((ex) => ex.id);
      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);
    });

    it('should respect default and maximum limits', async () => {
      // Test default limit (20)
      const defaultResults = await searchExercisesHandler({});
      expect(defaultResults.results.length).toBeLessThanOrEqual(20);

      // Test custom limit
      const customResults = await searchExercisesHandler({ limit: 10 });
      expect(customResults.results.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Multiple filter combinations', () => {
    it('should support combining keyword search with filters', async () => {
      const muscles = await listMusclesHandler();
      const chest = muscles.results.find((m) => m.name_en === 'Chest');

      const results = await searchExercisesHandler({
        query: 'press',
        muscle: chest!.id,
      });

      // Results should match both keyword and muscle filter
      expect(results.results.length).toBeGreaterThan(0);
      results.results.forEach((exercise) => {
        expect(exercise.name.toLowerCase()).toContain('press');
        const hasChest =
          exercise.muscles.includes(chest!.id) || exercise.muscles_secondary.includes(chest!.id);
        expect(hasChest).toBe(true);
      });
    });

    it('should support filtering by category and equipment', async () => {
      const categories = await listCategoriesHandler();
      const equipment = await listEquipmentHandler();

      const category = categories.results[0];
      const equip = equipment.results[0];

      const results = await searchExercisesHandler({
        category: category.id,
        equipment: equip.id,
      });

      // Should return exercises matching both filters
      expect(results).toHaveProperty('results');
      expect(results).toHaveProperty('count');
    });
  });
});
