/**
 * In-memory caching layer with TTL support
 * Provides automatic cleanup of expired entries
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

/**
 * Simple in-memory cache with time-to-live (TTL) support
 * Automatically cleans up expired entries periodically
 */
export class Cache {
  private cache: Map<string, CacheEntry<unknown>>;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null;
  private readonly cleanupIntervalMs: number;

  /**
   * Creates a new Cache instance
   * @param cleanupIntervalMs - How often to run cleanup (default: 10 minutes)
   */
  constructor(cleanupIntervalMs: number = 10 * 60 * 1000) {
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, size: 0 };
    this.cleanupInterval = null;
    this.cleanupIntervalMs = cleanupIntervalMs;
    this.startCleanup();
  }

  /**
   * Get a value from the cache
   * @param key - Cache key
   * @returns The cached value if present and not expired, undefined otherwise
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return undefined;
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set a value in the cache with TTL
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlSeconds - Time to live in seconds (default: 1 hour)
   */
  set<T>(key: string, value: T, ttlSeconds: number = 3600): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
    this.stats.size = this.cache.size;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key - Cache key
   * @returns True if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key from the cache
   * @param key - Cache key to delete
   * @returns True if key was deleted, false if it didn't exist
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, size: 0 };
  }

  /**
   * Get cache statistics
   * @returns Object containing hit/miss counts and current size
   */
  getStats(): Readonly<CacheStats> {
    return { ...this.stats };
  }

  /**
   * Remove all expired entries from the cache
   * This is called automatically at regular intervals
   */
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.stats.size = this.cache.size;
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.cleanupIntervalMs);

    // Don't prevent process from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop automatic cleanup interval
   * Should be called when cache is no longer needed
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Destroy the cache and clean up resources
   */
  destroy(): void {
    this.stopCleanup();
    this.clear();
  }
}

/**
 * Global cache instance for use across the application
 */
export const cache = new Cache();
