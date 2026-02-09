/**
 * Fallback Handler
 * Provides fallback mechanisms for critical operations
 * Allows graceful degradation when primary services fail
 */

export interface FallbackConfig {
  name: string; // Service name
  enableFallback: boolean; // Whether fallback is enabled
  useStaleData?: boolean; // Allow returning stale data
  allowPartialResults?: boolean; // Allow incomplete results
  defaultValue?: any; // Default value when all else fails
}

export interface FallbackResult<T> {
  success: boolean;
  source: 'primary' | 'fallback' | 'default' | 'stale';
  data?: T;
  error?: Error;
  isFallback: boolean;
  isStale?: boolean;
  timestamp: Date;
}

/**
 * Fallback Handler
 * Provides fallback mechanisms for fault tolerance
 */
export class FallbackHandler {
  private cacheStore: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(private readonly config: FallbackConfig) {
    if (!config.name) {
      throw new Error('FallbackHandler requires a name');
    }
  }

  /**
   * Execute with fallback
   */
  async execute<T>(
    primary: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<FallbackResult<T>> {
    const timestamp = new Date();

    try {
      // Try primary operation
      const data = await primary();
      
      // Cache successful result
      this.cacheStore.set(this.config.name, {
        data,
        timestamp: Date.now(),
      });

      return {
        success: true,
        source: 'primary',
        data,
        isFallback: false,
        timestamp,
      };
    } catch (primaryError) {
      // Primary failed, try fallback
      if (!this.config.enableFallback) {
        return {
          success: false,
          source: 'primary',
          error: primaryError as Error,
          isFallback: false,
          timestamp,
        };
      }

      // Try fallback if provided
      if (fallback) {
        try {
          const data = await fallback();
          return {
            success: true,
            source: 'fallback',
            data,
            isFallback: true,
            timestamp,
          };
        } catch (fallbackError) {
          // Fallback also failed
        }
      }

      // Try stale data
      if (this.config.useStaleData) {
        const cached = this.cacheStore.get(this.config.name);
        if (cached) {
          return {
            success: true,
            source: 'stale',
            data: cached.data,
            isFallback: true,
            isStale: true,
            timestamp,
          };
        }
      }

      // Return default value
      if (this.config.defaultValue !== undefined) {
        return {
          success: true,
          source: 'default',
          data: this.config.defaultValue,
          isFallback: true,
          timestamp,
        };
      }

      // All failed
      return {
        success: false,
        source: 'primary',
        error: primaryError as Error,
        isFallback: false,
        timestamp,
      };
    }
  }

  /**
   * Execute synchronously with fallback
   */
  executeSync<T>(
    primary: () => T,
    fallback?: () => T
  ): FallbackResult<T> {
    const timestamp = new Date();

    try {
      // Try primary operation
      const data = primary();

      // Cache successful result
      this.cacheStore.set(this.config.name, {
        data,
        timestamp: Date.now(),
      });

      return {
        success: true,
        source: 'primary',
        data,
        isFallback: false,
        timestamp,
      };
    } catch (primaryError) {
      // Primary failed, try fallback
      if (!this.config.enableFallback) {
        return {
          success: false,
          source: 'primary',
          error: primaryError as Error,
          isFallback: false,
          timestamp,
        };
      }

      // Try fallback if provided
      if (fallback) {
        try {
          const data = fallback();
          return {
            success: true,
            source: 'fallback',
            data,
            isFallback: true,
            timestamp,
          };
        } catch (fallbackError) {
          // Fallback also failed
        }
      }

      // Try stale data
      if (this.config.useStaleData) {
        const cached = this.cacheStore.get(this.config.name);
        if (cached) {
          return {
            success: true,
            source: 'stale',
            data: cached.data,
            isFallback: true,
            isStale: true,
            timestamp,
          };
        }
      }

      // Return default value
      if (this.config.defaultValue !== undefined) {
        return {
          success: true,
          source: 'default',
          data: this.config.defaultValue,
          isFallback: true,
          timestamp,
        };
      }

      // All failed
      return {
        success: false,
        source: 'primary',
        error: primaryError as Error,
        isFallback: false,
        timestamp,
      };
    }
  }

  /**
   * Cache data for fallback usage
   */
  cacheData(data: any): void {
    this.cacheStore.set(this.config.name, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached data
   */
  getCachedData(): any | undefined {
    return this.cacheStore.get(this.config.name)?.data;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cacheStore.delete(this.config.name);
  }

  /**
   * Get cache age in milliseconds
   */
  getCacheAge(): number | undefined {
    const cached = this.cacheStore.get(this.config.name);
    if (!cached) return undefined;
    return Date.now() - cached.timestamp;
  }

  /**
   * Check if cache is stale (older than threshold)
   */
  isCacheStale(maxAgeMs: number): boolean {
    const age = this.getCacheAge();
    return age === undefined || age > maxAgeMs;
  }
}

/**
 * Fallback Manager
 * Manages multiple fallback handlers
 */
export class FallbackManager {
  private handlers: Map<string, FallbackHandler> = new Map();

  /**
   * Get or create a fallback handler
   */
  getHandler(config: FallbackConfig): FallbackHandler {
    if (this.handlers.has(config.name)) {
      return this.handlers.get(config.name)!;
    }

    const handler = new FallbackHandler(config);
    this.handlers.set(config.name, handler);
    return handler;
  }

  /**
   * Get all cached data
   */
  getAllCache(): Record<string, { data: any; age: number }> {
    const result: Record<string, { data: any; age: number }> = {};

    this.handlers.forEach((handler, name) => {
      const cached = handler.getCachedData();
      const age = handler.getCacheAge();

      if (cached) {
        result[name] = {
          data: cached,
          age: age || 0,
        };
      }
    });

    return result;
  }

  /**
   * Clear all caches
   */
  clearAllCache(): void {
    this.handlers.forEach((handler) => {
      handler.clearCache();
    });
  }

  /**
   * Get stats for all handlers
   */
  getStats(): Record<string, any> {
    const result: Record<string, any> = {};

    this.handlers.forEach((handler, name) => {
      result[name] = {
        hasCachedData: handler.getCachedData() !== undefined,
        cacheAge: handler.getCacheAge(),
        enableFallback: handler.constructor.name,
      };
    });

    return result;
  }
}

/**
 * Graceful Degradation Helper
 * Helps implement partial functionality when services are unavailable
 */
export class GracefulDegradation {
  /**
   * Execute with graceful degradation
   * Returns partial results if primary operation fails
   */
  static async executeWithDegradation<T>(
    operations: Array<{ name: string; fn: () => Promise<T> }>,
    options?: {
      minRequiredSuccesses?: number;
      allowPartialResults?: boolean;
    }
  ): Promise<{ results: Record<string, T | null>; degraded: boolean }> {
    const results: Record<string, T | null> = {};
    const minRequired = options?.minRequiredSuccesses ?? 1;
    let successCount = 0;

    // Execute all operations in parallel
    const promises = operations.map(async ({ name, fn }) => {
      try {
        const result = await fn();
        results[name] = result;
        successCount++;
        return { name, success: true };
      } catch (error) {
        results[name] = null;
        return { name, success: false, error };
      }
    });

    await Promise.all(promises);

    const degraded = successCount < operations.length && successCount >= minRequired;

    return {
      results,
      degraded,
    };
  }

  /**
   * Check if system should be degraded based on metrics
   */
  static shouldDegrade(failureRate: number, threshold: number = 0.1): boolean {
    return failureRate > threshold;
  }

  /**
   * Get degradation status
   */
  static getDegradationStatus(
    services: Array<{ name: string; healthy: boolean }>
  ): {
    fully_degraded: boolean;
    partially_degraded: boolean;
    healthy_services: string[];
    unhealthy_services: string[];
  } {
    const healthyServices = services.filter((s) => s.healthy).map((s) => s.name);
    const unhealthyServices = services.filter((s) => !s.healthy).map((s) => s.name);

    return {
      fully_degraded: healthyServices.length === 0,
      partially_degraded:
        healthyServices.length > 0 && unhealthyServices.length > 0,
      healthy_services: healthyServices,
      unhealthy_services: unhealthyServices,
    };
  }
}
// Export preset configurations for fallback handlers
export const FALLBACK_PRESETS = {
  aggressive: {
    name: 'aggressive',
    enableFallback: true,
    useStaleData: true,
    allowPartialResults: true,
  } as FallbackConfig,
  conservative: {
    name: 'conservative',
    enableFallback: true,
    useStaleData: false,
    allowPartialResults: false,
  } as FallbackConfig,
};

// Export fallback strategies
export const FALLBACK_STRATEGIES = {
  STALE_DATA: 'stale_data',
  PARTIAL_RESULTS: 'partial_results',
  DEFAULT_VALUE: 'default_value',
  DEGRADED_MODE: 'degraded_mode',
} as const;