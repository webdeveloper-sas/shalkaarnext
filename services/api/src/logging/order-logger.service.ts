import { Injectable } from '@nestjs/common';
import { LoggerService } from '@shalkaar/logging';
import { ErrorTrackingService } from '@shalkaar/logging';

/**
 * Order Lifecycle Logger
 * Logs all order-related events throughout the customer journey
 * Tracks creation, status changes, fulfillment, and delivery
 */
@Injectable()
export class OrderLogger {
  constructor(
    private readonly logger: LoggerService,
    private readonly errorTracker: ErrorTrackingService
  ) {}

  /**
   * Log order created
   */
  logOrderCreated(
    orderId: string,
    userId: string,
    totalAmount: number,
    itemCount: number,
    currency: string = 'USD'
  ): void {
    const metadata = {
      event: 'order.created',
      orderId,
      userId,
      totalAmount,
      itemCount,
      currency,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Order created', metadata);
    this.errorTracker.addBreadcrumb(
      `Order created: ${this.formatAmount(totalAmount, currency)} (${itemCount} items)`,
      'order',
      'info',
      metadata
    );
  }

  /**
   * Log order status changed
   */
  logOrderStatusChanged(
    orderId: string,
    userId: string,
    oldStatus: string,
    newStatus: string,
    reason?: string
  ): void {
    const metadata = {
      event: 'order.status.changed',
      orderId,
      userId,
      oldStatus,
      newStatus,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.logger.info(`Order status changed: ${oldStatus} → ${newStatus}`, metadata);
    this.errorTracker.addBreadcrumb(
      `Status: ${oldStatus} → ${newStatus}${reason ? ` (${reason})` : ''}`,
      'order',
      'info',
      metadata
    );
  }

  /**
   * Log order confirmed
   */
  logOrderConfirmed(orderId: string, userId: string): void {
    const metadata = {
      event: 'order.confirmed',
      orderId,
      userId,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Order confirmed', metadata);
    this.errorTracker.addBreadcrumb(
      'Order confirmed',
      'order',
      'info',
      metadata
    );
  }

  /**
   * Log order processing started
   */
  logOrderProcessingStarted(orderId: string): void {
    const metadata = {
      event: 'order.processing.started',
      orderId,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Order processing started', metadata);
    this.errorTracker.addBreadcrumb(
      'Processing started',
      'order',
      'info',
      metadata
    );
  }

  /**
   * Log order prepared for shipment
   */
  logOrderPreparedForShipment(
    orderId: string,
    warehouseId?: string,
    preparedBy?: string
  ): void {
    const metadata = {
      event: 'order.prepared.shipment',
      orderId,
      warehouseId,
      preparedBy,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Order prepared for shipment', metadata);
    this.errorTracker.addBreadcrumb(
      'Prepared for shipment' + (warehouseId ? ` from ${warehouseId}` : ''),
      'order.fulfillment',
      'info',
      metadata
    );
  }

  /**
   * Log order shipped
   */
  logOrderShipped(
    orderId: string,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery?: string,
    shippedFrom?: string
  ): void {
    const metadata = {
      event: 'order.shipped',
      orderId,
      trackingNumber,
      carrier,
      estimatedDelivery,
      shippedFrom,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Order shipped', metadata);
    this.errorTracker.addBreadcrumb(
      `Shipped via ${carrier} - Tracking: ${this.maskTrackingNumber(trackingNumber)}`,
      'order.fulfillment',
      'info',
      metadata
    );
  }

  /**
   * Log order in transit
   */
  logOrderInTransit(
    orderId: string,
    trackingNumber: string,
    currentLocation?: string,
    estimatedDelivery?: string
  ): void {
    const metadata = {
      event: 'order.in.transit',
      orderId,
      trackingNumber,
      currentLocation,
      estimatedDelivery,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Order in transit', metadata);
    this.errorTracker.addBreadcrumb(
      `In transit${currentLocation ? ` at ${currentLocation}` : ''}`,
      'order.fulfillment',
      'info',
      metadata
    );
  }

  /**
   * Log order delivered
   */
  logOrderDelivered(
    orderId: string,
    userId: string,
    deliveryDate?: string,
    deliveredTo?: string
  ): void {
    const metadata = {
      event: 'order.delivered',
      orderId,
      userId,
      deliveryDate,
      deliveredTo,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Order delivered', metadata);
    this.errorTracker.addBreadcrumb(
      'Delivered' + (deliveredTo ? ` to ${deliveredTo}` : ''),
      'order.fulfillment',
      'info',
      metadata
    );
  }

  /**
   * Log delivery failed
   */
  logDeliveryFailed(
    orderId: string,
    reason: string,
    trackingNumber?: string,
    retryScheduled?: string
  ): void {
    const metadata = {
      event: 'order.delivery.failed',
      orderId,
      reason,
      trackingNumber,
      retryScheduled,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn('Delivery failed', metadata);
    this.errorTracker.addBreadcrumb(
      `Delivery failed: ${reason}${retryScheduled ? ` - Retry: ${retryScheduled}` : ''}`,
      'order.fulfillment',
      'warning',
      metadata
    );
  }

  /**
   * Log order cancelled
   */
  logOrderCancelled(
    orderId: string,
    userId: string,
    reason: string,
    cancelledBy: string = 'user'
  ): void {
    const metadata = {
      event: 'order.cancelled',
      orderId,
      userId,
      reason,
      cancelledBy,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Order cancelled', metadata);
    this.errorTracker.addBreadcrumb(
      `Cancelled: ${reason}`,
      'order',
      'warning',
      metadata
    );
  }

  /**
   * Log order returned
   */
  logOrderReturned(
    orderId: string,
    userId: string,
    returnId: string,
    reason: string,
    refundAmount?: number
  ): void {
    const metadata = {
      event: 'order.returned',
      orderId,
      userId,
      returnId,
      reason,
      refundAmount,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Order returned', metadata);
    this.errorTracker.addBreadcrumb(
      `Return initiated: ${reason}`,
      'order',
      'info',
      metadata
    );
  }

  /**
   * Log return processing started
   */
  logReturnProcessingStarted(returnId: string, orderId: string): void {
    const metadata = {
      event: 'return.processing.started',
      returnId,
      orderId,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Return processing started', metadata);
  }

  /**
   * Log return completed
   */
  logReturnCompleted(
    returnId: string,
    orderId: string,
    refundAmount: number,
    currency: string = 'USD'
  ): void {
    const metadata = {
      event: 'return.completed',
      returnId,
      orderId,
      refundAmount,
      currency,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Return completed', metadata);
    this.errorTracker.addBreadcrumb(
      `Return completed - Refund: ${this.formatAmount(refundAmount, currency)}`,
      'order',
      'info',
      metadata
    );
  }

  /**
   * Log item added to order
   */
  logItemAddedToOrder(
    orderId: string,
    productId: string,
    quantity: number,
    price: number
  ): void {
    const metadata = {
      event: 'order.item.added',
      orderId,
      productId,
      quantity,
      price,
      timestamp: new Date().toISOString(),
    };

    this.logger.debug('Item added to order', metadata);
  }

  /**
   * Log item removed from order
   */
  logItemRemovedFromOrder(
    orderId: string,
    productId: string,
    quantity: number,
    reason: string
  ): void {
    const metadata = {
      event: 'order.item.removed',
      orderId,
      productId,
      quantity,
      reason,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Item removed from order', metadata);
  }

  /**
   * Log order modified
   */
  logOrderModified(
    orderId: string,
    userId: string,
    changes: Record<string, any>
  ): void {
    const metadata = {
      event: 'order.modified',
      orderId,
      userId,
      changes,
      timestamp: new Date().toISOString(),
    };

    this.logger.info('Order modified', metadata);
  }

  /**
   * Log order issue
   */
  logOrderIssue(
    orderId: string,
    issueType: string,
    description: string,
    severity: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    const metadata = {
      event: 'order.issue',
      orderId,
      issueType,
      description,
      severity,
      timestamp: new Date().toISOString(),
    };

    const logLevel = severity === 'high' ? 'error' : 'warn';
    if (logLevel === 'error') {
      this.logger.error(`Order issue: ${issueType}`, metadata);
    } else {
      this.logger.warn(`Order issue: ${issueType}`, metadata);
    }

    this.errorTracker.addBreadcrumb(
      `Issue: ${issueType} - ${description}`,
      'order.issue',
      severity === 'high' ? 'error' : 'warning',
      metadata
    );
  }

  /**
   * Log customer notification sent
   */
  logNotificationSent(
    orderId: string,
    userId: string,
    notificationType: string,
    channel: string = 'email'
  ): void {
    const metadata = {
      event: 'order.notification.sent',
      orderId,
      userId,
      notificationType,
      channel,
      timestamp: new Date().toISOString(),
    };

    this.logger.debug('Order notification sent', metadata);
  }

  /**
   * Format amount for logging
   */
  private formatAmount(amount: number, currency: string): string {
    return `${currency} ${(amount / 100).toFixed(2)}`; // Assume amount in cents
  }

  /**
   * Mask tracking number for privacy
   */
  private maskTrackingNumber(trackingNumber: string): string {
    if (!trackingNumber || trackingNumber.length <= 6) return '[REDACTED]';
    return trackingNumber.substring(0, 6) + '***';
  }
}
