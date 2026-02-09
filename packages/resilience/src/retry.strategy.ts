/**
 * Retry Strategy with Exponential Backoff
 * Provides configurable retry mechanisms for transient failures
 */

export interface RetryConfig {
  maxRetries: number; // Maximum number of retry attempts
  initialDelayMs: number; // Initial delay in milliseconds
  maxDelayMs: number; // Maximum delay in milliseconds
  backoffMultiplier: number; // Multiplier for exponential backoff (e.g., 2 for doubling)
  jitterFactor: number; // Random jitter percentage (0-1)
}

export interface RetryOptions {
  name?: string; // For logging purposes
  onRetry?: (attempt: number, error: Error) => void; // Callback on retry
  isTransient?: (error: Error) => boolean; // Determine if error is transient
}

export interface RetryResult {
  success: boolean;
  data?: any;
  error?: Error;
  attempts: number;
  totalDurationMs: number;
}

/**
 * Retry Strategy
 * Implements exponential backoff with jitter for reliable retry logic
 */
export class RetryStrategy {
  private readonly config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      initialDelayMs: config.initialDelayMs ?? 100,
      maxDelayMs: config.maxDelayMs ?? 30000, // 30 seconds max
      backoffMultiplier: config.backoffMultiplier ?? 2,
      jitterFactor: config.jitterFactor ?? 0.1, // 10% jitter
    };

    // Validate config
    if (this.config.maxRetries < 1) {
      throw new Error('maxRetries must be at least 1');
    }
    if (this.config.initialDelayMs < 0) {
      throw new Error('initialDelayMs must be non-negative');
    }
    if (this.config.backoffMultiplier < 1) {
      throw new Error('backoffMultiplier must be >= 1');
    }
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult> {
    const startTime = Date.now();
    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt < this.config.maxRetries) {
      try {
        attempt++;
        const data = await fn();
        const totalDurationMs = Date.now() - startTime;

        return {
          success: true,
          data,
          attempts: attempt,
          totalDurationMs,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is transient
        if (!this.isTransientError(error, options.isTransient)) {
          // Non-transient error - don't retry
          const totalDurationMs = Date.now() - startTime;
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            totalDurationMs,
          };
        }

        // If this is the last attempt, don't wait
        if (attempt >= this.config.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt);

        // Call retry callback if provided
        if (options.onRetry) {
          options.onRetry(attempt, lastError);
        }

        // Wait before retry
        await this.sleep(delay);
      }
    }

    const totalDurationMs = Date.now() - startTime;
    return {
      success: false,
      error: lastError,
      attempts: attempt,
      totalDurationMs,
    };
  }

  /**
   * Execute function synchronously with retry logic
   */
  executeSync<T>(
    fn: () => T,
    options: RetryOptions = {}
  ): RetryResult {
    const startTime = Date.now();
    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt < this.config.maxRetries) {
      try {
        attempt++;
        const data = fn();
        const totalDurationMs = Date.now() - startTime;

        return {
          success: true,
          data,
          attempts: attempt,
          totalDurationMs,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is transient
        if (!this.isTransientError(error, options.isTransient)) {
          // Non-transient error - don't retry
          const totalDurationMs = Date.now() - startTime;
          return {
            success: false,
            error: lastError,
            attempts: attempt,
            totalDurationMs,
          };
        }

        // If this is the last attempt, don't wait
        if (attempt >= this.config.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt);

        // Call retry callback if provided
        if (options.onRetry) {
          options.onRetry(attempt, lastError);
        }

        // Wait before retry (synchronous sleep)
        this.sleepSync(delay);
      }
    }

    const totalDurationMs = Date.now() - startTime;
    return {
      success: false,
      error: lastError,
      attempts: attempt,
      totalDurationMs,
    };
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number): number {
    // Exponential backoff: initialDelay * (multiplier ^ (attempt - 1))
    const exponentialDelay = this.config.initialDelayMs * 
      Math.pow(this.config.backoffMultiplier, attempt - 1);

    // Cap at maxDelayMs
    const cappedDelay = Math.min(exponentialDelay, this.config.maxDelayMs);

    // Add jitter: random value between 0 and jitterFactor * cappedDelay
    const jitter = Math.random() * this.config.jitterFactor * cappedDelay;

    return Math.floor(cappedDelay + jitter);
  }

  /**
   * Determine if error is transient (retryable)
   */
  private isTransientError(
    error: any,
    customCheck?: (error: Error) => boolean
  ): boolean {
    // Custom check takes precedence
    if (customCheck) {
      const err = error instanceof Error ? error : new Error(String(error));
      return customCheck(err);
    }

    // Default transient error detection
    if (!(error instanceof Error)) {
      return false;
    }

    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors (transient)
    if (
      name.includes('timeout') ||
      name.includes('econnrefused') ||
      name.includes('econnreset') ||
      name.includes('enotfound') ||
      name.includes('networkerror') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('connection refused')
    ) {
      return true;
    }

    // HTTP 5xx errors (transient)
    if ((error as any).statusCode >= 500 && (error as any).statusCode < 600) {
      return true;
    }

    // HTTP 429 (Too Many Requests) - transient
    if ((error as any).statusCode === 429) {
      return true;
    }

    // Specific transient patterns
    if (
      message.includes('unavailable') ||
      message.includes('temporarily') ||
      message.includes('try again') ||
      message.includes('rate limit')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Sleep for specified milliseconds (async)
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sleep for specified milliseconds (sync - not ideal but sometimes necessary)
   */
  private sleepSync(ms: number): void {
    const start = Date.now();
    while (Date.now() - start < ms) {
      // Busy wait
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): RetryConfig {
    return { ...this.config };
  }
}

/**
 * Preset retry configurations
 */
export const RETRY_PRESETS = {
  // Fast retries for quick operations
  FAST: {
    maxRetries: 3,
    initialDelayMs: 50,
    maxDelayMs: 500,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
  },

  // Medium retries for normal operations
  NORMAL: {
    maxRetries: 4,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
  },

  // Slow retries for critical operations
  SLOW: {
    maxRetries: 5,
    initialDelayMs: 500,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.2,
  },

  // Network operations with longer backoff
  NETWORK: {
    maxRetries: 5,
    initialDelayMs: 200,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    jitterFactor: 0.15,
  },

  // Database operations
  DATABASE: {
    maxRetries: 3,
    initialDelayMs: 100,
    maxDelayMs: 2000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
  },

  // Payment operations (critical, longer backoff)
  PAYMENT: {
    maxRetries: 5,
    initialDelayMs: 500,
    maxDelayMs: 15000,
    backoffMultiplier: 2,
    jitterFactor: 0.2,
  },
};
