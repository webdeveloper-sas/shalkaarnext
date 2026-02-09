import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhookHandlerService } from './webhook-handler.service';
import { PaymentEventHandler } from './payment-event.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * Webhooks Module
 * Handles all webhook processing, including:
 * - Stripe payment webhook events
 * - Event signature verification
 * - Idempotency handling
 * - Retry logic
 * - Event routing
 */
@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [WebhooksController],
  providers: [WebhookHandlerService, PaymentEventHandler],
  exports: [WebhookHandlerService, PaymentEventHandler],
})
export class WebhooksModule {}
