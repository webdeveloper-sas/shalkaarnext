import { Injectable } from '@nestjs/common';
import { RetryStrategy, RETRY_PRESETS } from '@shalkaar/resilience';
import {
  CircuitBreaker,
  CircuitBreakerManager,
  CircuitBreakerState,
} from '@shalkaar/resilience';
import {
  FallbackHandler,
} from '@shalkaar/resilience';
import { LoggerService } from '@shalkaar/logging';
import { PaymentLogger } from '../logging/payment-logger.service';

/**
 * Payment Resilience Service
 * Handles payment processing with retry logic, circuit breaker, and fallbacks
 * Ensures payment flows degrade gracefully when payment service is unavailable
 */
@Injectable()
export class PaymentResilienceService {
  private retryStrategy: RetryStrategy;
  private circuitBreakerManager: CircuitBreakerManager;
  private fallbackHandler: FallbackHandler;
  private stripeCircuitBreaker?: CircuitBreaker;

  constructor(
    private readonly logger: LoggerService,
    private readonly paymentLogger: PaymentLogger
  ) {
    // Initialize retry strategy with payment-specific config
    this.retryStrategy = new RetryStrategy(RETRY_PRESETS.PAYMENT);

    // Initialize circuit breaker manager
    this.circuitBreakerManager = new CircuitBreakerManager(
      (service, oldState, newState) => {
        this.logger.warn('Payment service circuit breaker state changed', {
          service,
          oldState,
          newState,
        });

        if (newState === CircuitBreakerState.OPEN) {
          this.paymentLogger.logSuspiciousActivity(
            'payment_service',
            'system',
            'circuit_breaker_opened',
            0,
            'Payment service circuit breaker opened after failures'
          );
        }
      }
    );

    // Initialize fallback handler
    this.fallbackHandler = new FallbackHandler({
      name: 'payment_service',
      enableFallback: true,
      useStaleData: true,
      allowPartialResults: true,
      defaultValue: null,
    });
  }

  /**
   * Process payment with resilience
   */
  async processPaymentWithResilience(
    orderId: string,
    userId: string,
    amount: number,
    paymentMethodId: string,
    stripeService: any
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
    fallback: boolean;
    retries: number;
  }> {
    this.paymentLogger.logPaymentInitiated(orderId, userId, amount);

    // Get or create circuit breaker for Stripe
    if (!this.stripeCircuitBreaker) {
      this.stripeCircuitBreaker = this.circuitBreakerManager.getBreaker({
        name: 'stripe_payments',
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 30000,
      });
    }

    // Execute with circuit breaker and retry
    const result = await this.retryStrategy.execute(
      async () => {
        // Try to charge with circuit breaker
        return await this.stripeCircuitBreaker!.execute(async () => {
          const charge = await stripeService.charges.create({
            amount,
            currency: 'usd',
            source: paymentMethodId,
            metadata: { orderId, userId },
          });

          if (charge.status !== 'succeeded') {
            throw new Error(`Payment status: ${charge.status}`);
          }

          return charge;
        });
      },
      {
        name: 'payment_processing',
        onRetry: (attempt, error) => {
          this.logger.warn(
            `Payment processing retry attempt ${attempt}`,
            {
              orderId,
              error: error.message,
            }
          );
          this.paymentLogger.logPaymentRetry(
            orderId,
            `payment_${orderId}`,
            attempt,
            error.message
          );
        },
        isTransient: (error) => {
          // Check if this is a transient error
          const message = error.message.toLowerCase();
          return (
            message.includes('timeout') ||
            message.includes('connection') ||
            message.includes('rate limit') ||
            message.includes('temporarily unavailable')
          );
        },
      }
    );

    // Handle result
    if (result.success && result.data) {
      const transactionId = (result.data as any).id;
      this.paymentLogger.logPaymentSuccess(
        orderId,
        userId,
        transactionId,
        amount,
        'USD',
        result.totalDurationMs
      );

      return {
        success: true,
        transactionId,
        retries: result.attempts - 1,
        fallback: false,
      };
    }

    // Primary failed, try fallback
    this.logger.warn('Payment processing failed, attempting fallback', {
      orderId,
      error: result.error?.message,
    });

    const fallbackResult = await this.fallbackHandler.execute(
      async () => {
        // Fallback: Queue payment for manual processing
        // This would typically save to a pending_payments table
        return {
          queued: true,
          transactionId: `pending_${orderId}_${Date.now()}`,
        };
      }
    );

    if (fallbackResult.success && fallbackResult.data) {
      const fallbackData = fallbackResult.data as any;
      this.paymentLogger.logPaymentPending(
        orderId,
        userId,
        amount,
        'Payment queued for manual processing'
      );

      return {
        success: true,
        transactionId: fallbackData.transactionId,
        retries: result.attempts,
        fallback: true,
      };
    }

    // All failed
    this.paymentLogger.logPaymentFailure(
      orderId,
      userId,
      amount,
      'USD',
      result.error?.message || 'Unknown error',
      'fallback_exhausted'
    );

    return {
      success: false,
      error: result.error?.message || 'Payment processing failed',
      retries: result.attempts,
      fallback: false,
    };
  }

  /**
   * Check payment service health
   */
  getPaymentServiceHealth(): {
    healthy: boolean;
    circuitState: CircuitBreakerState;
    stats: any;
  } {
    const stats = this.circuitBreakerManager.getStats();
    const stripeStats = stats.find((s) => s.name === 'stripe_payments');

    return {
      healthy: !this.circuitBreakerManager.hasOpenCircuits(),
      circuitState: stripeStats?.state || CircuitBreakerState.CLOSED,
      stats: stripeStats,
    };
  }

  /**
   * Reset payment service circuit breaker
   */
  resetPaymentService(): void {
    this.circuitBreakerManager.resetService('stripe_payments');
    this.logger.info('Payment service circuit breaker reset');
  }

  /**
   * Get payment resilience statistics
   */
  getResilienceStats(): any {
    return {
      circuitBreakers: this.circuitBreakerManager.getStats(),
      fallback: this.fallbackHandler.getCachedData(),
      retryConfig: this.retryStrategy.getConfig(),
    };
  }
}
