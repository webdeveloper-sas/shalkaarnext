'use client';

import { useEffect, useState } from 'react';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key: string;
}

/**
 * Custom hook for client-side caching with localStorage
 */
export function useCache<T>(
  fetcher: () => Promise<T>,
  options: CacheOptions
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getCachedData = () => {
    try {
      const cached = localStorage.getItem(options.key);
      if (!cached) return null;

      const { data: cachedData, timestamp } = JSON.parse(cached);
      const age = (Date.now() - timestamp) / 1000;

      if (options.ttl && age > options.ttl) {
        localStorage.removeItem(options.key);
        return null;
      }

      return cachedData;
    } catch {
      return null;
    }
  };

  const setCachedData = (newData: T) => {
    try {
      localStorage.setItem(
        options.key,
        JSON.stringify({
          data: newData,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error('Cache storage error:', err);
    }
  };

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      setCachedData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Try to use cache first
    const cached = getCachedData();
    if (cached) {
      setData(cached);
      setIsLoading(false);
      return;
    }

    // Fetch fresh data
    refetch();
  }, [options.key]);

  return { data, isLoading, error, refetch };
}

/**
 * Cache invalidation helper
 */
export function invalidateCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Cache invalidation error:', err);
  }
}

/**
 * Clear all cached data matching a pattern
 */
export function invalidateCachePattern(pattern: string): void {
  try {
    const keys = Object.keys(localStorage);
    const regex = new RegExp(pattern);
    
    keys.forEach((key) => {
      if (regex.test(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.error('Cache pattern invalidation error:', err);
  }
}

/**
 * Prefetch data into cache
 */
export async function prefetchToCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  _ttl: number = 3600
): Promise<void> {
  try {
    const data = await fetcher();
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (err) {
    console.error('Prefetch error:', err);
  }
}
