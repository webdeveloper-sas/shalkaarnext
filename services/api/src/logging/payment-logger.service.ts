import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shalkaar/logging';
import { ErrorTrackingService } from '@shalkaar/logging';

/**
 * Payment Event Logger
 * Logs all payment-related events for transaction tracking and monitoring
 * Includes payment processing, refunds, and payment gateway events
 */
@Injectable()
export class PaymentLogger {
  constructor(
    private readonly logger: LoggerService,
    private readonly errorTracker: ErrorTrackingService
  ) {}

  /**
   * Log payment initiated
   */
  logPaymentInitiated(
    orderId: string,
    userId: string,
    amount: number,
    currency: string = 'USD',
    paymentMethod?: string
  ): void {
    const metadata = {
      event: 'payment.initiated',
      orderId,
      userId,
      amount,
      currency,
      paymentMethod,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Payment initiated', metadata);
    this.errorTracker.addBreadcrumb(
      `Payment initiated: ${this.formatAmount(amount, currency)}`,
      'payment',
      'info',
      metadata
    );
  }

  /**
   * Log payment success
   */
  logPaymentSuccess(
    orderId: string,
    userId: string,
    paymentId: string,
    amount: number,
    currency: string = 'USD',
    processingTime?: number
  ): void {
    const metadata = {
      event: 'payment.success',
      orderId,
      userId,
      paymentId: this.maskPaymentId(paymentId),
      amount,
      currency,
      processingTime,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Payment processed successfully', metadata);
    this.errorTracker.addBreadcrumb(
      `Payment success: ${this.formatAmount(amount, currency)}`,
      'payment',
      'info',
      metadata
    );
  }

  /**
   * Log payment failure
   */
  logPaymentFailure(
    orderId: string,
    userId: string,
    amount: number,
    currency: string = 'USD',
    reason: string,
    errorCode?: string
  ): void {
    const metadata = {
      event: 'payment.failure',
      orderId,
      userId,
      amount,
      currency,
      reason,
      errorCode,
      timestamp: new Date().toISOString(),
    };

    this.logger.error('Payment failed', metadata);
    this.errorTracker.addBreadcrumb(
      `Payment failed: ${reason}`,
      'payment',
      'error',
      metadata
    );

    // Capture as error for tracking
    this.errorTracker.captureMessage(
      `Payment failed for order ${orderId}: ${reason}`,
      'error',
      metadata
    );
  }

  /**
   * Log payment pending
   */
  logPaymentPending(
    orderId: string,
    userId: string,
    amount: number,
    reason: string = 'Awaiting confirmation'
  ): void {
    const metadata = {
      event: 'payment.pending',
      orderId,
      userId,
      amount,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Payment pending', metadata);
    this.errorTracker.addBreadcrumb(
      'Payment pending: ' + reason,
      'payment',
      'warning',
      metadata
    );
  }

  /**
   * Log refund initiated
   */
  logRefundInitiated(
    orderId: string,
    userId: string,
    refundId: string,
    amount: number,
    currency: string = 'USD',
    reason: string
  ): void {
    const metadata = {
      event: 'refund.initiated',
      orderId,
      userId,
      refundId: this.maskPaymentId(refundId),
      amount,
      currency,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Refund initiated', metadata);
    this.errorTracker.addBreadcrumb(
      `Refund initiated: ${this.formatAmount(amount, currency)} - ${reason}`,
      'payment',
      'info',
      metadata
    );
  }

  /**
   * Log refund success
   */
  logRefundSuccess(
    orderId: string,
    refundId: string,
    amount: number,
    currency: string = 'USD',
    processingTime?: number
  ): void {
    const metadata = {
      event: 'refund.success',
      orderId,
      refundId: this.maskPaymentId(refundId),
      amount,
      currency,
      processingTime,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Refund processed successfully', metadata);
    this.errorTracker.addBreadcrumb(
      `Refund success: ${this.formatAmount(amount, currency)}`,
      'payment',
      'info',
      metadata
    );
  }

  /**
   * Log refund failure
   */
  logRefundFailure(
    orderId: string,
    refundId: string,
    amount: number,
    reason: string,
    errorCode?: string
  ): void {
    const metadata = {
      event: 'refund.failure',
      orderId,
      refundId: this.maskPaymentId(refundId),
      amount,
      reason,
      errorCode,
      timestamp: new Date().toISOString(),
    };

    this.logger.error('Refund failed', metadata);
    this.errorTracker.captureMessage(
      `Refund failed for order ${orderId}: ${reason}`,
      'error',
      metadata
    );
  }

  /**
   * Log payment webhook received
   */
  logWebhookReceived(
    eventType: string,
    eventId: string,
    paymentId: string,
    isDuplicate: boolean = false
  ): void {
    const metadata = {
      event: 'payment.webhook.received',
      eventType,
      eventId,
      paymentId: this.maskPaymentId(paymentId),
      isDuplicate,
      timestamp: new Date().toISOString(),
    };

    if (isDuplicate) {
      this.logger.debug('Duplicate webhook received (idempotency check)', metadata);
    } else {
      this.logger.info('Payment webhook received', metadata);
    }

    this.errorTracker.addBreadcrumb(
      `Webhook: ${eventType}${isDuplicate ? ' (duplicate)' : ''}`,
      'payment.webhook',
      isDuplicate ? 'debug' : 'info',
      metadata
    );
  }

  /**
   * Log webhook processing error
   */
  logWebhookError(
    eventType: string,
    eventId: string,
    reason: string,
    error?: Error
  ): void {
    const metadata = {
      event: 'payment.webhook.error',
      eventType,
      eventId,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.logger.error('Payment webhook processing error', metadata, error);
    this.errorTracker.addBreadcrumb(
      `Webhook error: ${eventType} - ${reason}`,
      'payment.webhook',
      'error',
      metadata
    );
  }

  /**
   * Log payment verification
   */
  logPaymentVerification(
    paymentId: string,
    verified: boolean,
    reason?: string
  ): void {
    const metadata = {
      event: 'payment.verification',
      paymentId: this.maskPaymentId(paymentId),
      verified,
      reason,
      timestamp: new Date().toISOString(),
    };

    if (verified) {
      this.logger.debug('Payment verified', metadata);
    } else {
      this.logger.warn('Payment verification failed', metadata);
      this.errorTracker.addBreadcrumb(
        'Payment verification failed: ' + (reason || 'unknown'),
        'payment',
        'warning',
        metadata
      );
    }
  }

  /**
   * Log payment retry
   */
  logPaymentRetry(
    orderId: string,
    paymentId: string,
    attempt: number,
    reason: string
  ): void {
    const metadata = {
      event: 'payment.retry',
      orderId,
      paymentId: this.maskPaymentId(paymentId),
      attempt,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.logger.info(`Payment retry attempt ${attempt}`, metadata);
    this.errorTracker.addBreadcrumb(
      `Payment retry ${attempt}: ${reason}`,
      'payment',
      'warning',
      metadata
    );
  }

  /**
   * Log suspicious payment activity
   */
  logSuspiciousActivity(
    orderId: string,
    userId: string,
    activity: string,
    amount: number,
    reason: string
  ): void {
    const metadata = {
      event: 'payment.suspicious.activity',
      orderId,
      userId,
      activity,
      amount,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.logger.error('Suspicious payment activity detected', metadata);
    this.errorTracker.captureMessage(
      `Suspicious payment activity: ${activity} for order ${orderId}`,
      'error',
      metadata
    );
  }

  /**
   * Log payment method changed
   */
  logPaymentMethodChanged(
    orderId: string,
    oldMethod: string,
    newMethod: string,
    userId: string
  ): void {
    const metadata = {
      event: 'payment.method.changed',
      orderId,
      oldMethod,
      newMethod,
      userId,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Payment method changed', metadata);
  }

  /**
   * Log invoice generated
   */
  logInvoiceGenerated(
    orderId: string,
    invoiceId: string,
    amount: number,
    currency: string = 'USD'
  ): void {
    const metadata = {
      event: 'payment.invoice.generated',
      orderId,
      invoiceId,
      amount,
      currency,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Invoice generated', metadata);
  }

  /**
   * Format amount for logging
   */
  private formatAmount(amount: number, currency: string): string {
    return `${currency} ${(amount / 100).toFixed(2)}`; // Assume amount in cents
  }

  /**
   * Mask payment ID
   */
  private maskPaymentId(id: string): string {
    if (!id || id.length <= 8) return '[REDACTED]';
    return id.substring(0, 8) + '***';
  }
}
