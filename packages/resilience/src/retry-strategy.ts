/**
 * Retry Strategy Service
 * Implements exponential backoff and intelligent retry logic
 * for transient failures without infinite retries
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  timeoutMs?: number;
  jitterFactor?: number; // 0-1, adds randomness to prevent thundering herd
  shouldRetry?: (error: any) => boolean; // Custom retry predicate
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
  totalDurationMs: number;
  lastError?: string;
}

export class RetryStrategy {
  private readonly defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelayMs: 100,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    timeoutMs: 30000,
    jitterFactor: 0.1,
    shouldRetry: (error) => this.isRetryable(error),
  };

  /**
   * Execute function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    options?: Partial<RetryOptions>
  ): Promise<RetryResult<T>> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    let lastError: any;
    let lastErrorMessage = '';

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        const timeoutPromise = this.createTimeout<T>(opts.timeoutMs);
        const result = await Promise.race([fn(), timeoutPromise]);

        return {
          success: true,
          data: result,
          attempts: attempt,
          totalDurationMs: Date.now() - startTime,
        };
      } catch (error: any) {
        lastError = error;
        lastErrorMessage = String(error?.message || error);

        // Check if error is retryable
        if (!opts.shouldRetry(error)) {
          return {
            success: false,
            error,
            attempts: attempt,
            totalDurationMs: Date.now() - startTime,
            lastError: lastErrorMessage,
          };
        }

        // Don't delay after last attempt
        if (attempt < opts.maxAttempts) {
          const delayMs = this.calculateDelay(attempt, opts);
          await this.sleep(delayMs);
        }
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: opts.maxAttempts,
      totalDurationMs: Date.now() - startTime,
      lastError: lastErrorMessage,
    };
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, options: Required<RetryOptions>): number {
    const exponentialDelay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, options.maxDelayMs);
    
    // Add jitter to prevent thundering herd
    const jitter = cappedDelay * options.jitterFactor * Math.random();
    return Math.round(cappedDelay + jitter);
  }

  /**
   * Create timeout promise
   */
  private createTimeout<T>(timeoutMs: number): Promise<T> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    );
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Determine if error is retryable
   */
  private isRetryable(error: any): boolean {
    // Network errors
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.code === 'ETIMEDOUT') {
      return true;
    }

    // HTTP status codes that are retryable
    const status = error?.status || error?.statusCode;
    if (status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
      return true;
    }

    // Timeout errors
    if (error?.message?.includes('timeout') || error?.message?.includes('TIMEOUT')) {
      return true;
    }

    return false;
  }
}
