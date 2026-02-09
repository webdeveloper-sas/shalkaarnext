import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { WebhookHandlerService } from './webhook-handler.service';
import { PaymentEventHandler } from './payment-event.handler';

/**
 * Stripe Webhook Controller
 * Handles incoming webhook events from Stripe
 */
@Controller('api/webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private webhookHandler: WebhookHandlerService,
    private paymentEventHandler: PaymentEventHandler
  ) {}

  /**
   * POST /api/webhooks/stripe
   * Receives and processes Stripe webhook events
   *
   * Stripe sends webhooks as POST requests with:
   * - Body: JSON event data
   * - Header stripe-signature: HMAC signature for verification
   */
  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string
  ): Promise<{ received: boolean; eventId?: string; error?: string }> {
    const rawBody = req.rawBody || req.body;

    // Verify signature
    let event: Stripe.Event;
    try {
      event = this.webhookHandler.verifyWebhookSignature(rawBody, signature);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Webhook signature verification failed: ${errorMessage}`);
      throw new BadRequestException(
        `Webhook verification failed: ${errorMessage}`
      );
    }

    // Check for duplicate processing (idempotency)
    if (this.webhookHandler.isEventProcessed(event.id)) {
      this.logger.log(
        `Webhook event already processed: ${event.id} (type: ${event.type})`
      );
      return {
        received: true,
        eventId: event.id,
      };
    }

    try {
      // Route to appropriate handler
      await this.routeWebhookEvent(event);

      // Mark as processed
      this.webhookHandler.markEventAsProcessed(event.id, event);

      this.logger.log(
        `Webhook event processed successfully: ${event.id} (type: ${event.type})`
      );

      return {
        received: true,
        eventId: event.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error processing webhook event ${event.id}: ${errorMessage}`
      );

      // Queue for retry
      this.webhookHandler.queueEventForRetry(event.id);

      // Return 200 to acknowledge receipt but indicate processing failed
      // Stripe will retry the webhook
      return {
        received: true,
        eventId: event.id,
        error: errorMessage,
      };
    }
  }

  /**
   * GET /api/webhooks/health
   * Health check endpoint
   */
  @Post('stripe/health')
  @HttpCode(HttpStatus.OK)
  async healthCheck(): Promise<{
    status: string;
    processedEvents: number;
    pendingRetries: number;
  }> {
    const stats = this.webhookHandler.getStatistics();
    return {
      status: 'ok',
      processedEvents: stats.processedEvents,
      pendingRetries: stats.pendingRetries,
    };
  }

  /**
   * GET /api/webhooks/stats
   * Get webhook statistics and event history
   */
  @Post('stripe/stats')
  @HttpCode(HttpStatus.OK)
  async getStats(): Promise<any> {
    const stats = this.webhookHandler.getStatistics();
    const history = this.webhookHandler.getEventHistory(20);

    return {
      ...stats,
      recentEvents: history,
    };
  }

  /**
   * Route webhook event to appropriate handler
   */
  private async routeWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      // Payment events
      case 'payment_intent.succeeded':
        await this.paymentEventHandler.handlePaymentIntentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        await this.paymentEventHandler.handlePaymentIntentFailed(event);
        break;

      case 'charge.refunded':
        await this.paymentEventHandler.handleChargeRefunded(event);
        break;

      // Acknowledge other events but don't process
      case 'payment_method.attached':
      case 'payment_method.detached':
      case 'customer.created':
      case 'customer.updated':
        this.logger.debug(`Webhook event acknowledged: ${event.type}`);
        break;

      default:
        this.logger.warn(`Unknown webhook event type: ${event.type}`);
    }
  }
}
