/// <reference types="@nestjs/common" />
/// <reference types="@shalkaar/logging" />
/// <reference types="@shalkaar/security" />
/// <reference types="@shalkaar/resilience" />

// Type declarations for external packages
declare module '@shalkaar/logging' {
  export interface LogContext {
    userId?: string;
    requestId?: string;
    correlationId?: string;
    sessionId?: string;
    [key: string]: any;
  }

  export interface ErrorContext {
    userId?: string;
    requestId?: string;
    action?: string;
    resource?: string;
    [key: string]: any;
  }

  export interface Breadcrumb {
    timestamp: string;
    category: string;
    message: string;
    level: 'debug' | 'info' | 'warning' | 'error';
    data?: Record<string, any>;
  }

  export class LoggerService {
    setContext(context: LogContext): void;
    clearContext(): void;
    getContext(): LogContext;
    debug(message: string, metadata?: Record<string, any>, error?: Error): void;
    info(message: string, metadata?: Record<string, any>, error?: Error): void;
    warn(message: string, metadata?: Record<string, any>, error?: Error): void;
    error(message: string, metadata?: Record<string, any>, error?: Error): void;
    critical(message: string, metadata?: Record<string, any>, error?: Error): void;
    logRequest(method: string, path: string, statusCode?: number, duration?: number, metadata?: Record<string, any>): void;
    logDatabaseQuery(query: string, duration: number, metadata?: Record<string, any>): void;
    logExternalCall(service: string, endpoint: string, statusCode: number, duration: number, metadata?: Record<string, any>): void;
  }

  export class ErrorTrackingService {
    setUser(userId: string, email?: string, username?: string): void;
    clearUser(): void;
    setContext(key: string, value: any): void;
    getContext(): ErrorContext;
    captureError(error: Error | any, context?: ErrorContext, tags?: string[]): string;
    captureException(error: Error, context?: ErrorContext): string;
    captureMessage(message: string, level?: 'debug' | 'info' | 'warning' | 'error', context?: ErrorContext): string;
    addBreadcrumb(message: string, category?: string, level?: 'debug' | 'info' | 'warning' | 'error', data?: Record<string, any>): void;
    getBreadcrumbs(limit?: number): Breadcrumb[];
    clearBreadcrumbs(): void;
  }

  export class SensitiveDataFilter {
    maskObject(obj: any, depth?: number): any;
    maskString(str: string): string;
    maskUrl(url: string): string;
    maskHeaders(headers: Record<string, any>): Record<string, any>;
    hasSensitiveData(str: string): boolean;
  }

  export class LoggingModule {}
}

declare module '@shalkaar/resilience' {
  export enum CircuitBreakerState {
    CLOSED = 'closed',
    OPEN = 'open',
    HALF_OPEN = 'half_open',
  }

  export interface CircuitBreakerConfig {
    name: string;
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    resetTimeout?: number;
    onStateChange?: (service: string, oldState: CircuitBreakerState, newState: CircuitBreakerState) => void;
    isFailure?: (error: Error) => boolean;
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

  export class CircuitBreaker {
    constructor(config: CircuitBreakerConfig);
    execute<T>(fn: () => Promise<T>): Promise<T>;
    executeSync<T>(fn: () => T): T;
    getState(): CircuitBreakerState;
    isOpen(): boolean;
    isClosed(): boolean;
    isHalfOpen(): boolean;
    getStats(): CircuitBreakerStats;
    reset(): void;
  }

  export class CircuitBreakerManager {
    constructor(onStateChange?: (service: string, oldState: CircuitBreakerState, newState: CircuitBreakerState) => void);
    getBreaker(config: CircuitBreakerConfig): CircuitBreaker;
    getServiceStats(serviceName: string): CircuitBreakerStats | undefined;
    getStats(): CircuitBreakerStats[];
    hasOpenCircuits(): boolean;
    getOpenCircuits(): string[];
    resetAll(): void;
    resetService(serviceName: string): void;
  }

  export interface RetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    jitterFactor: number;
  }

  export interface RetryOptions {
    name?: string;
    onRetry?: (attempt: number, error: Error) => void;
    isTransient?: (error: Error) => boolean;
  }

  export interface RetryResult {
    success: boolean;
    data?: any;
    error?: Error;
    attempts: number;
    totalDurationMs: number;
  }

  export class RetryStrategy {
    constructor(config?: Partial<RetryConfig>);
    execute<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<RetryResult>;
    executeSync<T>(fn: () => T, options?: RetryOptions): RetryResult;
    getConfig(): RetryConfig;
  }

  export interface FallbackConfig {
    name: string;
    enableFallback: boolean;
    useStaleData?: boolean;
    allowPartialResults?: boolean;
    defaultValue?: any;
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

  export class FallbackHandler {
    constructor(config: FallbackConfig);
    execute<T>(primary: () => Promise<T>, fallback?: () => Promise<T>): Promise<FallbackResult<T>>;
    executeSync<T>(primary: () => T, fallback?: () => T): FallbackResult<T>;
    cacheData(data: any): void;
    getCachedData(): any | undefined;
    clearCache(): void;
    getCacheAge(): number | undefined;
  }

  export const RETRY_PRESETS: {
    FAST: Partial<RetryConfig>;
    NORMAL: Partial<RetryConfig>;
    SLOW: Partial<RetryConfig>;
    PAYMENT: Partial<RetryConfig>;
  };

  export const FALLBACK_PRESETS: Record<string, Partial<FallbackConfig>>;
  export const FALLBACK_STRATEGIES: Record<string, any>;
}

declare module '@shalkaar/security' {
  export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
  }

  export interface RateLimitInfo {
    current: number;
    limit: number;
    resetTime: number;
    remaining: number;
  }

  export class RateLimiterService {
    isWithinLimit(identifier: string, presetName: string | RateLimitConfig): { allowed: boolean; info: RateLimitInfo };
    getInfo(identifier: string, presetName: string | RateLimitConfig): RateLimitInfo;
    reset(identifier: string, presetName: string): void;
    resetAll(): void;
    getMetrics(): Record<string, Record<string, any>>;
  }

  export class BruteForceProtectionService {
    isAccountLocked(identifier: string): boolean;
    isIpBlocked(ipAddress: string): boolean;
    recordFailedAttempt(identifier: string, ipAddress: string, reason?: string): { locked: boolean; attemptsRemaining: number; lockoutUntil?: Date };
    recordSuccessfulLogin(identifier: string): void;
    unlockAccount(identifier: string): void;
    getStatus(identifier: string): any;
  }

  export class BruteForceProtection {
    isAccountLocked(identifier: string): boolean;
    isIpBlocked(ipAddress: string): boolean;
    recordFailedAttempt(identifier: string, ipAddress: string, reason?: string): { locked: boolean; attemptsRemaining: number; lockoutUntil?: Date };
    recordSuccessfulLogin(identifier: string): void;
    unlockAccount(identifier: string): void;
    getStatus(identifier: string): any;
  }

  export class ReplayAttackProtectionService {
    validateFreshness(nonce: string, timestamp: number): { valid: boolean; reason?: string };
    detectDuplicate(identifier: string, requestHash: string): { isDuplicate: boolean; count: number; allowed: boolean };
    generateNonce(): string;
    getNonceExpiry(): Date;
  }

  export class ReplayAttackProtection {
    validateFreshness(nonce: string, timestamp: number): { valid: boolean; reason?: string };
    detectDuplicate(identifier: string, requestHash: string): { isDuplicate: boolean; count: number; allowed: boolean };
    generateNonce(): string;
    getNonceExpiry(): Date;
  }

  export class RequestValidationService {
    validatePayload(payload: any, maxSize?: number): { valid: boolean; error?: string };
    sanitizeInput(input: string): string;
    validateEmail(email: string): boolean;
    validateJson(json: string): { valid: boolean; error?: string; data?: any };
    validateUrl(url: string): boolean;
  }

  export class RequestValidation {
    validate(req: any): boolean;
    getError(): any;
  }

  export interface BRUTE_FORCE_CONFIG {
    maxAttempts: number;
    lockoutDuration: number;
  }

  export interface REPLAY_ATTACK_CONFIG {
    windowMs: number;
    maxDuplicateRequests: number;
  }

  export interface REQUEST_VALIDATION_CONFIG {
    strict: boolean;
  }

  export const RATE_LIMIT_PRESETS: Record<string, RateLimitConfig>;
  export const BRUTE_FORCE_CONFIG: BRUTE_FORCE_CONFIG;
  export const REPLAY_ATTACK_CONFIG: REPLAY_ATTACK_CONFIG;
  export const REQUEST_VALIDATION_CONFIG: REQUEST_VALIDATION_CONFIG;
}
