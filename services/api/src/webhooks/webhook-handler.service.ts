import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  createdAt: Date;
  processed: boolean;
}

/**
 * Webhook Handler Service
 * Manages Stripe webhook events with signature verification and idempotency
 */
@Injectable()
export class WebhookHandlerService {
  private readonly logger = new Logger(WebhookHandlerService.name);
  private stripe: Stripe;
  private webhookSecret: string;
  private processedEvents: Map<string, WebhookEvent> = new Map();
  private eventRetryQueue: Array<{
    eventId: string;
    retries: number;
    nextRetry: Date;
  }> = [];

  constructor(private configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>(
      'STRIPE_SECRET_KEY'
    );
    this.webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
      ''
    );

    if (!stripeSecretKey) {
      this.logger.error('STRIPE_SECRET_KEY not configured');
      // Use empty string as fallback to avoid runtime errors
      this.stripe = new Stripe('', {
        apiVersion: '2024-04-10' as any,
      });
      return;
    }

    if (!this.webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured - webhook signature verification disabled');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-04-10' as any,
    });
  }

  /**
   * Verify webhook signature from Stripe
   * Returns the parsed event if valid, throws error if invalid
   */
  verifyWebhookSignature(
    body: string | Buffer,
    signature: string
  ): Stripe.Event {
    if (!this.webhookSecret) {
      this.logger.warn('Webhook signature verification disabled - no secret configured');
      // In non-production, allow unsigned events for testing
      try {
        return JSON.parse(body.toString()) as Stripe.Event;
      } catch {
        throw new Error('Invalid webhook body format');
      }
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.webhookSecret
      );

      this.logger.debug(
        `Webhook signature verified for event: ${event.id} (type: ${event.type})`
      );
      return event;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Webhook signature verification failed: ${errorMessage}`);
      throw new Error(`Webhook signature verification failed: ${errorMessage}`);
    }
  }

  /**
   * Check if event has already been processed (idempotency)
   */
  isEventProcessed(eventId: string): boolean {
    return this.processedEvents.has(eventId);
  }

  /**
   * Mark event as processed (idempotency)
   */
  markEventAsProcessed(eventId: string, event: Stripe.Event): void {
    this.processedEvents.set(eventId, {
      id: eventId,
      type: event.type,
      data: event.data,
      createdAt: new Date(),
      processed: true,
    });

    // Keep memory usage reasonable - remove old events after 7 days
    if (this.processedEvents.size > 10000) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      for (const [key, value] of this.processedEvents.entries()) {
        if (value.createdAt < sevenDaysAgo) {
          this.processedEvents.delete(key);
        }
      }
    }
  }

  /**
   * Get webhook event history (last N events)
   */
  getEventHistory(limit: number = 100): WebhookEvent[] {
    return Array.from(this.processedEvents.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Queue failed event for retry
   */
  queueEventForRetry(eventId: string, maxRetries: number = 3): void {
    const existingRetry = this.eventRetryQueue.find((r) => r.eventId === eventId);

    if (existingRetry) {
      if (existingRetry.retries < maxRetries) {
        existingRetry.retries += 1;
        existingRetry.nextRetry = this.calculateNextRetryTime(
          existingRetry.retries
        );
        this.logger.log(
          `Event ${eventId} queued for retry (attempt ${existingRetry.retries}/${maxRetries})`
        );
      } else {
        this.logger.error(
          `Event ${eventId} exceeded max retries (${maxRetries})`
        );
        this.eventRetryQueue = this.eventRetryQueue.filter(
          (r) => r.eventId !== eventId
        );
      }
    } else {
      this.eventRetryQueue.push({
        eventId,
        retries: 1,
        nextRetry: this.calculateNextRetryTime(1),
      });
      this.logger.log(`Event ${eventId} queued for retry (attempt 1/${maxRetries})`);
    }
  }

  /**
   * Get events ready for retry
   */
  getEventsReadyForRetry(): string[] {
    const now = new Date();
    return this.eventRetryQueue
      .filter((r) => r.nextRetry <= now)
      .map((r) => r.eventId);
  }

  /**
   * Remove event from retry queue
   */
  removeEventFromRetryQueue(eventId: string): void {
    this.eventRetryQueue = this.eventRetryQueue.filter(
      (r) => r.eventId !== eventId
    );
  }

  /**
   * Calculate next retry time with exponential backoff
   * Retry 1: 1 minute
   * Retry 2: 5 minutes
   * Retry 3: 30 minutes
   */
  private calculateNextRetryTime(retryAttempt: number): Date {
    const delays = [60, 300, 1800]; // seconds
    const delaySecs = delays[Math.min(retryAttempt - 1, delays.length - 1)];
    return new Date(Date.now() + delaySecs * 1000);
  }

  /**
   * Get webhook statistics
   */
  getStatistics(): {
    processedEvents: number;
    pendingRetries: number;
    eventTypes: Record<string, number>;
  } {
    const eventTypes: Record<string, number> = {};
    for (const event of this.processedEvents.values()) {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    }

    return {
      processedEvents: this.processedEvents.size,
      pendingRetries: this.eventRetryQueue.length,
      eventTypes,
    };
  }

  /**
   * Clear all in-memory data (use with caution)
   */
  clearMemoryCache(): void {
    this.processedEvents.clear();
    this.eventRetryQueue = [];
    this.logger.warn('Webhook handler memory cache cleared');
  }
}
