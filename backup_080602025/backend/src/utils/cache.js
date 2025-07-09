import { LRUCache } from 'lru-cache';
import log from './logger.js';

/**
 * In-memory cache implementation using LRU strategy
 * For production, consider using Redis
 */
class CacheManager {
  constructor() {
    this.cache = new LRUCache({
      max: 500, // Maximum number of items
      maxSize: 50 * 1024 * 1024, // 50MB max size
      sizeCalculation: (value) => {
        // Calculate size of cached item
        return JSON.stringify(value).length;
      },
      ttl: 1000 * 60 * 60, // 1 hour default TTL
      updateAgeOnGet: true,
      updateAgeOnHas: true,
      stale: true, // Return stale value while fetching new one
    });

    // Track cache metrics
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      const value = this.cache.get(key);

      if (value !== undefined) {
        this.metrics.hits++;
        log.debug('Cache hit', { key });
        return value;
      }

      this.metrics.misses++;
      log.debug('Cache miss', { key });
      return null;
    } catch (error) {
      log.error('Cache get error', error, { key });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttlSeconds = null) {
    try {
      const options = {};
      if (ttlSeconds) {
        options.ttl = ttlSeconds * 1000;
      }

      this.cache.set(key, value, options);
      this.metrics.sets++;

      log.debug('Cache set', {
        key,
        ttl: ttlSeconds || 'default',
        size: JSON.stringify(value).length,
      });

      return true;
    } catch (error) {
      log.error('Cache set error', error, { key });
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key) {
    try {
      const deleted = this.cache.delete(key);
      if (deleted) {
        this.metrics.deletes++;
        log.debug('Cache delete', { key });
      }
      return deleted;
    } catch (error) {
      log.error('Cache delete error', error, { key });
      return false;
    }
  }

  /**
   * Clear entire cache
   */
  async clear() {
    try {
      this.cache.clear();
      log.info('Cache cleared');
      return true;
    } catch (error) {
      log.error('Cache clear error', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      ...this.metrics,
      size: this.cache.size,
      calculatedSize: this.cache.calculatedSize,
      hitRate: this.metrics.hits / (this.metrics.hits + this.metrics.misses) || 0,
    };
  }

  /**
   * Check if key exists
   */
  async has(key) {
    return this.cache.has(key);
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key) {
    const remaining = this.cache.getRemainingTTL(key);
    return remaining ? Math.floor(remaining / 1000) : 0;
  }

  /**
   * Cache with automatic refresh
   */
  async getOrSet(key, fetchFunction, ttlSeconds = null) {
    try {
      let value = await this.get(key);

      if (value === null) {
        value = await fetchFunction();
        if (value !== null && value !== undefined) {
          await this.set(key, value, ttlSeconds);
        }
      }

      return value;
    } catch (error) {
      log.error('Cache getOrSet error', error, { key });
      throw error;
    }
  }

  /**
   * Batch get multiple keys
   */
  async mget(keys) {
    const results = {};
    for (const key of keys) {
      results[key] = await this.get(key);
    }
    return results;
  }

  /**
   * Batch set multiple key-value pairs
   */
  async mset(entries, ttlSeconds = null) {
    const results = {};
    for (const [key, value] of Object.entries(entries)) {
      results[key] = await this.set(key, value, ttlSeconds);
    }
    return results;
  }
}

// Create singleton instance
const cache = new CacheManager();

// Export cache instance and utility functions
export { cache };

/**
 * Cache key generators for consistent naming
 */
export const cacheKeys = {
  user: (userId) => `user:${userId}`,
  consultation: (consultationId) => `consultation:${consultationId}`,
  quote: (quoteId) => `quote:${quoteId}`,
  geminiResponse: (prompt) => `gemini:${Buffer.from(prompt).toString('base64').substring(0, 32)}`,
  analytics: (metric, period) => `analytics:${metric}:${period}`,
  session: (sessionId) => `session:${sessionId}`,
};

/**
 * Cache decorator for methods
 */
export function Cacheable(keyGenerator, ttlSeconds = 3600) {
  return function (target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const key = keyGenerator(...args);

      // Try to get from cache
      const cached = await cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Cache the result
      if (result !== null && result !== undefined) {
        await cache.set(key, result, ttlSeconds);
      }

      return result;
    };

    return descriptor;
  };
}
