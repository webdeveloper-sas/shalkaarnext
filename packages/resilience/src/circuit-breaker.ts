/**
 * Circuit Breaker Pattern
 * Prevents cascading failures by monitoring external service health
 * States: CLOSED (normal) -> OPEN (failing) -> HALF_OPEN (testing) -> CLOSED
 */

export enum CircuitBreakerState {
  CLOSED = 'closed', // Normal operation
  OPEN = 'open', // Failing, rejecting requests
  HALF_OPEN = 'half_open', // Testing if service recovered
}

export interface CircuitBreakerConfig {
  name: string; // Service name for logging
  failureThreshold: number; // Failures before opening circuit
  successThreshold: number; // Successes while half-open before closing
  timeout: number; // Time in ms before attempting recovery (half-open)
  resetTimeout?: number; // Custom reset timeout
  onStateChange?: (
    service: string,
    oldState: CircuitBreakerState,
    newState: CircuitBreakerState
  ) => void; // Callback on state change
  isFailure?: (error: Error) => boolean; // Custom failure detector
}

export interface CircuitBreakerStats {
  name: string;
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  lastFailure?: Date;
  openedAt?: Date;
  halfOpenedAt?: Date;
  totalRequests: number;
  failureRate: number;
}

/**
 * Circuit Breaker
 * Implements the circuit breaker pattern for fault tolerance
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailure?: Date;
  private openedAt?: Date;
  private halfOpenedAt?: Date;
  private nextAttemptTime?: number;
  private totalRequests: number = 0;

  constructor(private readonly config: CircuitBreakerConfig) {
    if (!config.name) {
      throw new Error('CircuitBreaker requires a name');
    }
    if (config.failureThreshold < 1) {
      throw new Error('failureThreshold must be at least 1');
    }
    if (config.successThreshold < 1) {
      throw new Error('successThreshold must be at least 1');
    }
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // If circuit is open and timeout hasn't passed, reject immediately
    if (
      this.state === CircuitBreakerState.OPEN &&
      this.nextAttemptTime &&
      Date.now() < this.nextAttemptTime
    ) {
      throw new Error(
        `Circuit breaker for ${this.config.name} is OPEN. ` +
        `Service is temporarily unavailable. Retry after ${new Date(this.nextAttemptTime).toISOString()}`
      );
    }

    // If circuit is open but timeout passed, move to half-open
    if (
      this.state === CircuitBreakerState.OPEN &&
      this.nextAttemptTime &&
      Date.now() >= this.nextAttemptTime
    ) {
      this.setState(CircuitBreakerState.HALF_OPEN);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  /**
   * Execute function synchronously with circuit breaker protection
   */
  executeSync<T>(fn: () => T): T {
    this.totalRequests++;

    // If circuit is open and timeout hasn't passed, reject immediately
    if (
      this.state === CircuitBreakerState.OPEN &&
      this.nextAttemptTime &&
      Date.now() < this.nextAttemptTime
    ) {
      throw new Error(
        `Circuit breaker for ${this.config.name} is OPEN. ` +
        `Service is temporarily unavailable.`
      );
    }

    // If circuit is open but timeout passed, move to half-open
    if (
      this.state === CircuitBreakerState.OPEN &&
      this.nextAttemptTime &&
      Date.now() >= this.nextAttemptTime
    ) {
      this.setState(CircuitBreakerState.HALF_OPEN);
    }

    try {
      const result = fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  /**
   * Called when request succeeds
   */
  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successes++;

      // If we've had enough successes, close the circuit
      if (this.successes >= this.config.successThreshold) {
        this.reset();
      }
    }
  }

  /**
   * Called when request fails
   */
  private onFailure(error: Error): void {
    this.lastFailure = new Date();
    this.successes = 0;

    // Check if this is a failure we should count
    if (
      this.config.isFailure &&
      !this.config.isFailure(error)
    ) {
      // Not a tracked failure
      return;
    }

    this.failures++;

    // If we've reached the failure threshold, open the circuit
    if (
      this.failures >= this.config.failureThreshold &&
      this.state !== CircuitBreakerState.OPEN
    ) {
      this.open();
    }
  }

  /**
   * Open the circuit (stop accepting requests)
   */
  private open(): void {
    this.setState(CircuitBreakerState.OPEN);
    this.openedAt = new Date();

    // Schedule recovery attempt
    const timeout = this.config.resetTimeout || this.config.timeout;
    this.nextAttemptTime = Date.now() + timeout;
  }

  /**
   * Reset the circuit to closed state
   */
  private reset(): void {
    this.setState(CircuitBreakerState.CLOSED);
    this.failures = 0;
    this.successes = 0;
    this.lastFailure = undefined;
    this.openedAt = undefined;
    this.halfOpenedAt = undefined;
    this.nextAttemptTime = undefined;
  }

  /**
   * Change state and notify listeners
   */
  private setState(newState: CircuitBreakerState): void {
    const oldState = this.state;
    this.state = newState;

    if (newState === CircuitBreakerState.HALF_OPEN) {
      this.halfOpenedAt = new Date();
    }

    if (oldState !== newState && this.config.onStateChange) {
      this.config.onStateChange(this.config.name, oldState, newState);
    }
  }

  /**
   * Get circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      name: this.config.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      openedAt: this.openedAt,
      halfOpenedAt: this.halfOpenedAt,
      totalRequests: this.totalRequests,
      failureRate: this.totalRequests > 0 
        ? (this.failures / this.totalRequests) * 100 
        : 0,
    };
  }

  /**
   * Get current state
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Check if circuit is open
   */
  isOpen(): boolean {
    return this.state === CircuitBreakerState.OPEN;
  }

  /**
   * Check if circuit is half-open
   */
  isHalfOpen(): boolean {
    return this.state === CircuitBreakerState.HALF_OPEN;
  }

  /**
   * Check if circuit is closed
   */
  isClosed(): boolean {
    return this.state === CircuitBreakerState.CLOSED;
  }

  /**
   * Manually reset the circuit
   */
  forceReset(): void {
    this.reset();
  }

  /**
   * Manually open the circuit
   */
  forceOpen(): void {
    this.open();
  }
}

/**
 * Circuit Breaker Manager
 * Manages multiple circuit breakers
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();
  private readonly onStateChange?: (
    service: string,
    oldState: CircuitBreakerState,
    newState: CircuitBreakerState
  ) => void;

  constructor(onStateChange?: CircuitBreakerConfig['onStateChange']) {
    this.onStateChange = onStateChange;
  }

  /**
   * Get or create a circuit breaker
   */
  getBreaker(config: CircuitBreakerConfig): CircuitBreaker {
    if (this.breakers.has(config.name)) {
      return this.breakers.get(config.name)!;
    }

    const configWithCallback = {
      ...config,
      onStateChange: this.onStateChange || config.onStateChange,
    };

    const breaker = new CircuitBreaker(configWithCallback);
    this.breakers.set(config.name, breaker);
    return breaker;
  }

  /**
   * Get all circuit breakers and their stats
   */
  getStats(): CircuitBreakerStats[] {
    return Array.from(this.breakers.values()).map((breaker) =>
      breaker.getStats()
    );
  }

  /**
   * Get stats for a specific service
   */
  getServiceStats(serviceName: string): CircuitBreakerStats | undefined {
    return this.breakers.get(serviceName)?.getStats();
  }

  /**
   * Check if any circuit is open
   */
  hasOpenCircuits(): boolean {
    return Array.from(this.breakers.values()).some((breaker) =>
      breaker.isOpen()
    );
  }

  /**
   * Get all open circuits
   */
  getOpenCircuits(): string[] {
    return Array.from(this.breakers.entries())
      .filter(([, breaker]) => breaker.isOpen())
      .map(([name]) => name);
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.breakers.forEach((breaker) => {
      breaker.forceReset();
    });
  }

  /**
   * Reset a specific circuit breaker
   */
  resetService(serviceName: string): void {
    this.breakers.get(serviceName)?.forceReset();
  }
}
