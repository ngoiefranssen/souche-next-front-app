/**
 * Simple in-memory cache with TTL (Time To Live)
 * Used for caching reference data like profiles, roles, employment statuses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get data from cache
   * Returns null if cache miss or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache with TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > entry.ttl;
      if (isExpired) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const cache = new Cache();

/**
 * Cache decorator for async functions
 * Automatically caches function results with TTL
 *
 * @example
 * const getCachedProfiles = withCache(
 *   'profiles',
 *   () => profilesAPI.getAll(),
 *   5 * 60 * 1000 // 5 minutes
 * );
 */
export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): () => Promise<T> {
  return async () => {
    // Check cache first
    const cached = cache.get<T>(key);
    if (cached !== null) {
      console.log(`[Cache] Hit: ${key}`);
      return cached;
    }

    // Cache miss, fetch data
    console.log(`[Cache] Miss: ${key}`);
    const data = await fn();

    // Store in cache
    cache.set(key, data, ttl);

    return data;
  };
}

/**
 * Hook-friendly cache wrapper
 * Returns cached data or fetches if not available
 *
 * @example
 * const profiles = await getCached('profiles', () => profilesAPI.getAll());
 */
export async function getCached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fn();
  cache.set(key, data, ttl);
  return data;
}

/**
 * Invalidate cache for specific keys or patterns
 *
 * @example
 * invalidateCache('profiles'); // Invalidate specific key
 * invalidateCache(/^profiles/); // Invalidate all keys starting with 'profiles'
 */
export function invalidateCache(pattern: string | RegExp): void {
  if (typeof pattern === 'string') {
    cache.delete(pattern);
    return;
  }

  // Pattern matching
  const keys = cache.getStats().keys;
  for (const key of keys) {
    if (pattern.test(key)) {
      cache.delete(key);
    }
  }
}

// Clear expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      cache.clearExpired();
    },
    5 * 60 * 1000
  );
}
