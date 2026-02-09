import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shalkaar/logging';

/**
 * Rate Limiting Configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export interface RateLimitInfo {
  current: number;
  limit: number;
  resetTime: number;
  remaining: number;
}

/**
 * Rate Limiter Service
 * Implements in-memory rate limiting with multiple presets
 * For production, integrate with Redis
 */
@Injectable()
export class RateLimiterService {
  private store: Map<string, RateLimitStore> = new Map();
  private readonly cleanupInterval = 60000; // Cleanup every minute

  private readonly presets = {
    // Auth endpoints: 5 attempts per 15 minutes
    auth: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
    },
    // Payment endpoints: 10 per minute
    payment: {
      windowMs: 60 * 1000,
      maxRequests: 10,
    },
    // Webhook endpoints: 100 per minute
    webhook: {
      windowMs: 60 * 1000,
      maxRequests: 100,
    },
    // API endpoints: 100 per minute
    api: {
      windowMs: 60 * 1000,
      maxRequests: 100,
    },
    // Checkout: 20 per minute
    checkout: {
      windowMs: 60 * 1000,
      maxRequests: 20,
    },
  };

  constructor(private readonly logger: LoggerService) {
    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  /**
   * Check if request is within rate limit
   */
  isWithinLimit(
    identifier: string,
    presetName: keyof typeof this.presets | RateLimitConfig
  ): { allowed: boolean; info: RateLimitInfo } {
    const config =
      typeof presetName === 'string' ? this.presets[presetName] : presetName;

    if (!config) {
      return { allowed: true, info: { current: 0, limit: 0, remaining: 0, resetTime: 0 } };
    }

    const now = Date.now();
    const key = identifier;

    // Get or create store for this preset
    if (!this.store.has(presetName as string)) {
      this.store.set(presetName as string, {});
    }

    const presetStore = this.store.get(presetName as string)!;

    // Initialize or reset if window expired
    if (!presetStore[key] || now > presetStore[key].resetTime) {
      presetStore[key] = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    const resetTime = presetStore[key].resetTime;
    const count = presetStore[key].count;
    const allowed = count < config.maxRequests;

    const info: RateLimitInfo = {
      current: count,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count - 1),
      resetTime: resetTime,
    };

    if (allowed) {
      presetStore[key].count++;
    } else {
      this.logger.warn('Rate limit exceeded', {
        identifier,
        preset: presetName,
        current: count,
        limit: config.maxRequests,
      });
    }

    return { allowed, info };
  }

  /**
   * Get rate limit info without incrementing
   */
  getInfo(
    identifier: string,
    presetName: keyof typeof this.presets | RateLimitConfig
  ): RateLimitInfo {
    const config =
      typeof presetName === 'string' ? this.presets[presetName] : presetName;

    if (!config) {
      return { current: 0, limit: 0, remaining: 0, resetTime: 0 };
    }

    const key = identifier;
    const presetStore = this.store.get(presetName as string);

    if (!presetStore || !presetStore[key]) {
      return {
        current: 0,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
      };
    }

    const count = presetStore[key].count;
    const resetTime = presetStore[key].resetTime;

    return {
      current: count,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetTime,
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string, presetName: keyof typeof this.presets): void {
    const presetStore = this.store.get(presetName);
    if (presetStore && presetStore[identifier]) {
      delete presetStore[identifier];
    }
  }

  /**
   * Reset all rate limits (for testing)
   */
  resetAll(): void {
    this.store.clear();
  }

  /**
   * Get metrics
   */
  getMetrics(): Record<string, Record<string, any>> {
    const metrics: Record<string, Record<string, any>> = {};

    for (const [preset, presetStore] of this.store.entries()) {
      metrics[preset] = {
        entries: Object.keys(presetStore).length,
        total: Object.values(presetStore).reduce((sum, entry) => sum + entry.count, 0),
      };
    }

    return metrics;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [, presetStore] of this.store.entries()) {
      for (const [key, entry] of Object.entries(presetStore)) {
        if (now > entry.resetTime) {
          delete presetStore[key];
        }
      }
    }
  }
}
// Export preset configurations
export const RATE_LIMIT_PRESETS = {
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
  payment: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  webhook: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },
  api: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },
  checkout: {
    windowMs: 60 * 1000,
    maxRequests: 20,
  },
} as const;