/**
 * Unit tests for cache module
 * Tests critical caching behaviors including get/set, TTL, and cleanup
 */

import { Cache } from '../../../src/client/cache';

describe('Cache', () => {
  let cache: Cache;

  beforeEach(() => {
    // Create new cache instance with short cleanup interval for testing
    cache = new Cache(100);
  });

  afterEach(() => {
    // Clean up cache instance
    cache.destroy();
  });

  describe('get and set', () => {
    it('should store and retrieve values', () => {
      const key = 'test-key';
      const value = { data: 'test value' };

      cache.set(key, value, 3600);
      const retrieved = cache.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should return undefined for non-existent keys', () => {
      const result = cache.get('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', async () => {
      const key = 'expiring-key';
      const value = 'test';

      // Set with 50ms TTL
      cache.set(key, value, 0.05);

      // Should exist immediately
      expect(cache.get(key)).toBe(value);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Should be expired
      expect(cache.get(key)).toBeUndefined();
    });

    it('should track cache stats correctly', () => {
      cache.set('key1', 'value1', 3600);
      cache.set('key2', 'value2', 3600);

      // Hit
      cache.get('key1');
      // Miss
      cache.get('non-existent');

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.size).toBe(2);
    });
  });

  describe('has and delete', () => {
    it('should check if keys exist', () => {
      cache.set('key', 'value', 3600);

      expect(cache.has('key')).toBe(true);
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should delete specific keys', () => {
      cache.set('key1', 'value1', 3600);
      cache.set('key2', 'value2', 3600);

      const deleted = cache.delete('key1');

      expect(deleted).toBe(true);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all entries and reset stats', () => {
      cache.set('key1', 'value1', 3600);
      cache.set('key2', 'value2', 3600);
      cache.get('key1'); // Record a hit

      cache.clear();

      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should automatically clean up expired entries', async () => {
      // Set entries with very short TTL
      cache.set('key1', 'value1', 0.05); // 50ms
      cache.set('key2', 'value2', 0.05);

      // Wait for expiration and cleanup
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Both should be cleaned up
      const stats = cache.getStats();
      expect(stats.size).toBe(0);
    });
  });
});
