/**
 * Resilience Configuration
 * Centralized configuration for all resilience patterns
 */

export interface ResilienceConfig {
  retry: {
    enabled: boolean;
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    jitterFactor: number;
  };
  circuitBreaker: {
    enabled: boolean;
    failureThreshold: number;
    successThreshold: number;
    timeoutMs: number;
    resetTimeoutMs?: number;
  };
  fallback: {
    enabled: boolean;
    useStaleData: boolean;
    allowPartialResults: boolean;
  };
  gracefulShutdown: {
    enabled: boolean;
    timeoutMs: number;
    drainTimeoutMs: number;
    closeTimeoutMs: number;
  };
  healthCheck: {
    enabled: boolean;
    intervalMs: number;
    timeoutMs: number;
  };
}

/**
 * Get resilience configuration from environment
 */
export function getResilienceConfig(): ResilienceConfig {
  return {
    retry: {
      enabled: process.env.RETRY_ENABLED !== 'false',
      maxRetries: parseInt(process.env.RETRY_MAX_ATTEMPTS || '4', 10),
      initialDelayMs: parseInt(process.env.RETRY_INITIAL_DELAY || '100', 10),
      maxDelayMs: parseInt(process.env.RETRY_MAX_DELAY || '30000', 10),
      backoffMultiplier: parseFloat(process.env.RETRY_BACKOFF_MULTIPLIER || '2'),
      jitterFactor: parseFloat(process.env.RETRY_JITTER_FACTOR || '0.1'),
    },

    circuitBreaker: {
      enabled: process.env.CIRCUIT_BREAKER_ENABLED !== 'false',
      failureThreshold: parseInt(
        process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5',
        10
      ),
      successThreshold: parseInt(
        process.env.CIRCUIT_BREAKER_SUCCESS_THRESHOLD || '2',
        10
      ),
      timeoutMs: parseInt(
        process.env.CIRCUIT_BREAKER_TIMEOUT || '30000',
        10
      ),
      resetTimeoutMs: process.env.CIRCUIT_BREAKER_RESET_TIMEOUT
        ? parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT, 10)
        : undefined,
    },

    fallback: {
      enabled: process.env.FALLBACK_ENABLED !== 'false',
      useStaleData: process.env.FALLBACK_USE_STALE_DATA !== 'false',
      allowPartialResults: process.env.FALLBACK_ALLOW_PARTIAL !== 'false',
    },

    gracefulShutdown: {
      enabled: process.env.GRACEFUL_SHUTDOWN_ENABLED !== 'false',
      timeoutMs: parseInt(
        process.env.GRACEFUL_SHUTDOWN_TIMEOUT || '30000',
        10
      ),
      drainTimeoutMs: parseInt(
        process.env.GRACEFUL_SHUTDOWN_DRAIN_TIMEOUT || '5000',
        10
      ),
      closeTimeoutMs: parseInt(
        process.env.GRACEFUL_SHUTDOWN_CLOSE_TIMEOUT || '10000',
        10
      ),
    },

    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
      intervalMs: parseInt(process.env.HEALTH_CHECK_INTERVAL || '60000', 10),
      timeoutMs: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '10000', 10),
    },
  };
}

/**
 * Environment-specific resilience configurations
 */
export const ENVIRONMENT_CONFIGS = {
  development: {
    retry: {
      enabled: true,
      maxRetries: 2,
      initialDelayMs: 50,
      maxDelayMs: 1000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
    },
    circuitBreaker: {
      enabled: false, // Less strict in dev
      failureThreshold: 10,
      successThreshold: 3,
      timeoutMs: 10000,
    },
    fallback: {
      enabled: true,
      useStaleData: false,
      allowPartialResults: true,
    },
    gracefulShutdown: {
      enabled: true,
      timeoutMs: 10000,
      drainTimeoutMs: 2000,
      closeTimeoutMs: 5000,
    },
    healthCheck: {
      enabled: true,
      intervalMs: 30000,
      timeoutMs: 5000,
    },
  },

  staging: {
    retry: {
      enabled: true,
      maxRetries: 4,
      initialDelayMs: 100,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      jitterFactor: 0.15,
    },
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      successThreshold: 2,
      timeoutMs: 30000,
    },
    fallback: {
      enabled: true,
      useStaleData: true,
      allowPartialResults: true,
    },
    gracefulShutdown: {
      enabled: true,
      timeoutMs: 30000,
      drainTimeoutMs: 5000,
      closeTimeoutMs: 10000,
    },
    healthCheck: {
      enabled: true,
      intervalMs: 60000,
      timeoutMs: 10000,
    },
  },

  production: {
    retry: {
      enabled: true,
      maxRetries: 5,
      initialDelayMs: 200,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      jitterFactor: 0.2,
    },
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      successThreshold: 3,
      timeoutMs: 60000, // Longer reset timeout
    },
    fallback: {
      enabled: true,
      useStaleData: true,
      allowPartialResults: true,
    },
    gracefulShutdown: {
      enabled: true,
      timeoutMs: 45000,
      drainTimeoutMs: 10000,
      closeTimeoutMs: 15000,
    },
    healthCheck: {
      enabled: true,
      intervalMs: 60000,
      timeoutMs: 15000,
    },
  },
};

/**
 * Service-specific resilience profiles
 */
export const SERVICE_PROFILES = {
  // Payment service: strict, longer timeouts, more retries
  PAYMENT: {
    retry: {
      maxRetries: 5,
      initialDelayMs: 500,
      maxDelayMs: 15000,
      backoffMultiplier: 2,
      jitterFactor: 0.2,
    },
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 3,
      timeoutMs: 60000,
    },
  },

  // Database: moderate, critical
  DATABASE: {
    retry: {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 2000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
    },
    circuitBreaker: {
      failureThreshold: 10,
      successThreshold: 2,
      timeoutMs: 30000,
    },
  },

  // External APIs: moderate, with degradation
  EXTERNAL_API: {
    retry: {
      maxRetries: 4,
      initialDelayMs: 200,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
      jitterFactor: 0.15,
    },
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 2,
      timeoutMs: 30000,
    },
  },

  // Cache: lenient, non-critical
  CACHE: {
    retry: {
      maxRetries: 1,
      initialDelayMs: 50,
      maxDelayMs: 500,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
    },
    circuitBreaker: {
      failureThreshold: 20,
      successThreshold: 5,
      timeoutMs: 10000,
    },
  },

  // Checkout flow: strict, allows degradation
  CHECKOUT: {
    retry: {
      maxRetries: 3,
      initialDelayMs: 100,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
    },
    circuitBreaker: {
      failureThreshold: 10,
      successThreshold: 3,
      timeoutMs: 30000,
    },
  },
};

/**
 * Preset health check configurations
 */
export const HEALTH_CHECK_PRESETS = {
  FAST: {
    intervalMs: 30000, // 30 seconds
    timeoutMs: 5000, // 5 second timeout
  },

  NORMAL: {
    intervalMs: 60000, // 1 minute
    timeoutMs: 10000, // 10 second timeout
  },

  SLOW: {
    intervalMs: 120000, // 2 minutes
    timeoutMs: 20000, // 20 second timeout
  },
};

/**
 * Shutdown timeout configurations
 */
export const SHUTDOWN_PRESETS = {
  FAST: {
    gracefulShutdownTimeoutMs: 10000,
    drainTimeoutMs: 2000,
    closeTimeoutMs: 5000,
  },

  NORMAL: {
    gracefulShutdownTimeoutMs: 30000,
    drainTimeoutMs: 5000,
    closeTimeoutMs: 10000,
  },

  SLOW: {
    gracefulShutdownTimeoutMs: 60000,
    drainTimeoutMs: 15000,
    closeTimeoutMs: 20000,
  },
};

/**
 * Degradation thresholds
 */
export const DEGRADATION_THRESHOLDS = {
  // Percentage of requests that must fail to trigger degradation
  ERROR_RATE: parseFloat(process.env.DEGRADATION_ERROR_RATE || '0.1'), // 10%
  
  // Response time threshold (milliseconds)
  RESPONSE_TIME: parseInt(process.env.DEGRADATION_RESPONSE_TIME || '5000', 10), // 5s

  // Memory usage threshold (percentage)
  MEMORY_USAGE: parseFloat(process.env.DEGRADATION_MEMORY_USAGE || '0.85'), // 85%

  // Database connection pool threshold
  DB_POOL_THRESHOLD: parseFloat(process.env.DEGRADATION_DB_POOL || '0.9'), // 90%
};
