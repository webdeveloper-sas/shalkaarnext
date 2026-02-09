import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import Stripe from 'stripe';

/**
 * Payment Event Handler
 * Processes Stripe payment-related webhook events
 * Updates order status and sends notifications
 */
@Injectable()
export class PaymentEventHandler {
  private readonly logger = new Logger(PaymentEventHandler.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  /**
   * Handle payment intent succeeded event
   * Updates order status to PAID and sends success notification
   */
  async handlePaymentIntentSucceeded(
    event: Stripe.Event
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      // Find order by transaction ID (Stripe payment intent ID)
      const order = await this.prisma.order.findFirst({
        where: {
          transactionId: paymentIntent.id,
        },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        this.logger.warn(
          `Order not found for payment intent: ${paymentIntent.id}`
        );
        return {
          success: false,
          error: 'Order not found',
        };
      }

      // Update order status to PAID
      const updatedOrder = await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paymentStatus: 'COMPLETED',
        },
      });

      this.logger.log(
        `Order ${order.orderNumber} marked as PAID (Payment Intent: ${paymentIntent.id})`
      );

      // Send payment success email
      const emailAddress = order.customerEmail || order.user.email;
      const emailData = this.buildPaymentSuccessEmailData(updatedOrder, paymentIntent);
      const emailResult = await this.emailService.sendPaymentSuccessNotification(
        emailAddress,
        emailData
      );

      if (!emailResult.success) {
        this.logger.warn(
          `Failed to send payment success email for order ${order.orderNumber}`
        );
      }

      return {
        success: true,
        orderId: order.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error handling payment intent succeeded: ${errorMessage}`
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Handle payment intent payment failed event
   * Updates order status and sends failure notification
   */
  async handlePaymentIntentFailed(
    event: Stripe.Event
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      // Find order by transaction ID
      const order = await this.prisma.order.findFirst({
        where: {
          transactionId: paymentIntent.id,
        },
        include: {
          user: true,
        },
      });

      if (!order) {
        this.logger.warn(
          `Order not found for failed payment intent: ${paymentIntent.id}`
        );
        return {
          success: false,
          error: 'Order not found',
        };
      }

      // Update order status to PAYMENT_FAILED
      const updatedOrder = await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAYMENT_FAILED',
          paymentStatus: 'FAILED',
        },
      });

      this.logger.log(
        `Order ${order.orderNumber} marked as PAYMENT_FAILED (Payment Intent: ${paymentIntent.id})`
      );

      // Extract failure reason
      const failureMessage = this.getPaymentFailureReason(paymentIntent);

      // Send payment failed email
      const emailAddress = order.customerEmail || order.user.email;
      const emailData = this.buildPaymentFailedEmailData(
        updatedOrder,
        paymentIntent,
        failureMessage
      );
      const emailResult = await this.emailService.sendPaymentFailureNotification(
        emailAddress,
        emailData
      );

      if (!emailResult.success) {
        this.logger.warn(
          `Failed to send payment failure email for order ${order.orderNumber}`
        );
      }

      return {
        success: true,
        orderId: order.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error handling payment intent payment failed: ${errorMessage}`
      );
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Handle charge refunded event
   * Updates order status and creates refund record
   */
  async handleChargeRefunded(
    event: Stripe.Event
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    const charge = event.data.object as Stripe.Charge;

    try {
      // Find order by transaction ID (charge is linked to payment intent which is stored as transactionId)
      const order = await this.prisma.order.findFirst({
        where: {
          transactionId: charge.payment_intent as string,
        },
        include: {
          user: true,
        },
      });

      if (!order) {
        this.logger.warn(`Order not found for charge: ${charge.id}`);
        return {
          success: false,
          error: 'Order not found',
        };
      }

      // Determine refund amount (full or partial)
      const refundAmount = charge.amount_refunded;
      const isFullRefund = refundAmount >= charge.amount;

      // Update order refund status
      const refundStatus = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: refundStatus,
          paymentStatus: 'REFUNDED',
        },
      });

      this.logger.log(
        `Order ${order.orderNumber} refunded (Amount: $${(refundAmount / 100).toFixed(2)}, Type: ${isFullRefund ? 'FULL' : 'PARTIAL'})`
      );

      return {
        success: true,
        orderId: order.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling charge refunded: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Helper: Build payment success email data
   */
  private buildPaymentSuccessEmailData(
    order: any,
    paymentIntent: Stripe.PaymentIntent
  ): any {
    return {
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentAmount: (paymentIntent.amount / 100).toFixed(2),
      paymentMethod: this.getPaymentMethodDescription(paymentIntent),
      paymentDate: new Date(paymentIntent.created * 1000),
      transactionId: paymentIntent.id,
      orderUrl: `${process.env.API_URL}/orders/${order.id}`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@shalkaar.com',
    };
  }

  /**
   * Helper: Build payment failed email data
   */
  private buildPaymentFailedEmailData(
    order: any,
    paymentIntent: Stripe.PaymentIntent,
    failureReason: string
  ): any {
    return {
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      orderId: order.id,
      orderNumber: order.orderNumber,
      failureReason,
      attemptedAmount: (paymentIntent.amount / 100).toFixed(2),
      orderUrl: `${process.env.API_URL}/orders/${order.id}`,
      retryUrl: `${process.env.API_URL}/orders/${order.id}/retry-payment`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@shalkaar.com',
    };
  }

  /**
   * Helper: Get payment method description
   */
  private getPaymentMethodDescription(paymentIntent: Stripe.PaymentIntent): string {
    // Access charges safely from payment intent
    let charge: Stripe.Charge | null = null;
    if (paymentIntent && typeof paymentIntent === 'object' && 'charges' in paymentIntent) {
      const charges = (paymentIntent as any).charges?.data;
      if (Array.isArray(charges) && charges.length > 0) {
        charge = charges[0];
      }
    }

    if (!charge) {
      return 'Unknown';
    }

    const paymentMethod = charge.payment_method_details;

    if (!paymentMethod) {
      return 'Credit Card';
    }

    if ('card' in paymentMethod && paymentMethod.card?.brand) {
      return `${paymentMethod.card.brand.toUpperCase()} ending in ${paymentMethod.card.last4}`;
    }

    return 'Credit Card';
  }

  /**
   * Helper: Get payment failure reason
   */
  private getPaymentFailureReason(paymentIntent: Stripe.PaymentIntent): string {
    if (paymentIntent.last_payment_error) {
      const error = paymentIntent.last_payment_error;

      switch (error.code) {
        case 'card_declined':
          return 'Your card was declined. Please try a different payment method.';
        case 'expired_card':
          return 'Your card has expired. Please use a valid card.';
        case 'incorrect_cvc':
          return 'The CVC code you entered is incorrect.';
        case 'processing_error':
          return 'A processing error occurred. Please try again later.';
        case 'rate_limit':
          return 'Too many payment attempts. Please try again later.';
        default:
          return error.message || 'Payment processing failed. Please try again.';
      }
    }

    return 'Payment processing failed. Please try again.';
  }
}
