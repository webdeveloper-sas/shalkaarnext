// Main exports for resilience package
export { CircuitBreaker, CircuitBreakerManager, CircuitBreakerState } from './src/circuit-breaker';
export { RetryStrategy, RETRY_PRESETS } from './src/retry.strategy';
export { FallbackHandler, FALLBACK_PRESETS, FALLBACK_STRATEGIES } from './src/fallback.handler';
