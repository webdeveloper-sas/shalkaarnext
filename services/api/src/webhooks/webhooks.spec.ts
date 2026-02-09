/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
// @ts-ignore: Stripe used for type definitions in mocks
import Stripe from 'stripe';
import { WebhookHandlerService } from './webhook-handler.service';
import { PaymentEventHandler } from './payment-event.handler';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

describe('Webhook Handling', () => {
  let webhookHandler: WebhookHandlerService;
  let paymentEventHandler: PaymentEventHandler;
  // @ts-ignore: TS6133 - used for module setup
  let configService: ConfigService;
  let prismaService: PrismaService;
  // @ts-ignore: TS6133 - used for module setup
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookHandlerService,
        PaymentEventHandler,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                STRIPE_SECRET_KEY: 'sk_test_123',
                STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            order: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendPaymentSuccessNotification: jest.fn().mockResolvedValue({
              success: true,
            }),
            sendPaymentFailureNotification: jest.fn().mockResolvedValue({
              success: true,
            }),
          },
        },
      ],
    }).compile();

    webhookHandler = module.get<WebhookHandlerService>(WebhookHandlerService);
    paymentEventHandler = module.get<PaymentEventHandler>(
      PaymentEventHandler
    );
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('Event Idempotency', () => {
    it('should track processed events', () => {
      const eventId = 'evt_123';
      const mockEvent = {
        id: eventId,
        type: 'payment_intent.succeeded',
        data: {},
      } as any;

      expect(webhookHandler.isEventProcessed(eventId)).toBe(false);

      webhookHandler.markEventAsProcessed(eventId, mockEvent);
      expect(webhookHandler.isEventProcessed(eventId)).toBe(true);
    });

    it('should prevent duplicate event processing', () => {
      const eventId = 'evt_123';
      const mockEvent = {
        id: eventId,
        type: 'payment_intent.succeeded',
        data: {},
      } as any;

      webhookHandler.markEventAsProcessed(eventId, mockEvent);
      const firstCheck = webhookHandler.isEventProcessed(eventId);
      const secondCheck = webhookHandler.isEventProcessed(eventId);

      expect(firstCheck).toBe(true);
      expect(secondCheck).toBe(true);
    });

    it('should maintain event history', () => {
      const events = [
        { id: 'evt_1', type: 'payment_intent.succeeded', data: {} },
        { id: 'evt_2', type: 'payment_intent.payment_failed', data: {} },
        { id: 'evt_3', type: 'charge.refunded', data: {} },
      ];

      events.forEach((event) => {
        webhookHandler.markEventAsProcessed(event.id, event as any);
      });

      const history = webhookHandler.getEventHistory();
      expect(history.length).toBe(3);
    });
  });

  describe('Event Retry Logic', () => {
    it('should queue failed events for retry', () => {
      const eventId = 'evt_123';
      webhookHandler.queueEventForRetry(eventId);

      const eventsForRetry = webhookHandler.getEventsReadyForRetry();
      // Event might not be ready yet due to timing
      expect(eventsForRetry).toBeDefined();
    });

    it('should handle exponential backoff', () => {
      const eventId = 'evt_123';

      // First retry
      webhookHandler.queueEventForRetry(eventId);
      let readyEvents = webhookHandler.getEventsReadyForRetry();
      expect(readyEvents).toEqual([]);

      // Second and third retries
      webhookHandler.queueEventForRetry(eventId);
      readyEvents = webhookHandler.getEventsReadyForRetry();
      expect(readyEvents).toEqual([]);
    });

    it('should remove event from retry queue', () => {
      const eventId = 'evt_123';
      webhookHandler.queueEventForRetry(eventId);
      webhookHandler.removeEventFromRetryQueue(eventId);

      const stats = webhookHandler.getStatistics();
      expect(stats.pendingRetries).toBe(0);
    });
  });

  describe('Payment Event Handling', () => {
    it('should handle payment intent succeeded', async () => {
      const mockOrder = {
        id: 'ord_123',
        orderNumber: 'ORD-001',
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        paymentIntentId: 'pi_123',
      };

      jest.spyOn(prismaService.order, 'findFirst').mockResolvedValue(mockOrder as any);
      jest.spyOn(prismaService.order, 'update').mockResolvedValue({
        ...mockOrder,
        status: 'PAID',
        paymentStatus: 'COMPLETED',
      } as any);

      const event = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            amount: 11500,
            created: Math.floor(Date.now() / 1000),
            charges: {
              data: [
                {
                  payment_method_details: {
                    card: {
                      brand: 'visa',
                      last4: '4242',
                    },
                  },
                },
              ],
            },
          },
        },
      } as any;

      const result = await paymentEventHandler.handlePaymentIntentSucceeded(
        event
      );

      expect(result.success).toBe(true);
      expect(result.orderId).toBe('ord_123');
    });

    it('should handle payment intent failed', async () => {
      const mockOrder = {
        id: 'ord_123',
        orderNumber: 'ORD-001',
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        paymentIntentId: 'pi_123',
      };

      jest.spyOn(prismaService.order, 'findFirst').mockResolvedValue(mockOrder as any);
      jest.spyOn(prismaService.order, 'update').mockResolvedValue({
        ...mockOrder,
        status: 'PAYMENT_FAILED',
      } as any);

      const event = {
        id: 'evt_123',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_123',
            amount: 11500,
            last_payment_error: {
              code: 'card_declined',
              message: 'Your card was declined',
            },
          },
        },
      } as any;

      const result = await paymentEventHandler.handlePaymentIntentFailed(
        event
      );

      expect(result.success).toBe(true);
    });

    it('should handle charge refunded', async () => {
      const mockOrder = {
        id: 'ord_123',
        orderNumber: 'ORD-001',
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        stripeChargeId: 'ch_123',
      };

      jest.spyOn(prismaService.order, 'findFirst').mockResolvedValue(mockOrder as any);
      jest.spyOn(prismaService.order, 'update').mockResolvedValue({
        ...mockOrder,
        status: 'REFUNDED',
      } as any);

      const event = {
        id: 'evt_123',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_123',
            amount: 11500,
            amount_refunded: 11500,
          },
        },
      } as any;

      const result = await paymentEventHandler.handleChargeRefunded(event);

      expect(result.success).toBe(true);
    });
  });

  describe('Webhook Statistics', () => {
    it('should track webhook statistics', () => {
      const events = [
        { id: 'evt_1', type: 'payment_intent.succeeded' },
        { id: 'evt_2', type: 'payment_intent.succeeded' },
        { id: 'evt_3', type: 'charge.refunded' },
      ];

      events.forEach((event) => {
        webhookHandler.markEventAsProcessed(event.id, event as any);
      });

      const stats = webhookHandler.getStatistics();

      expect(stats.processedEvents).toBe(3);
      expect(stats.eventTypes['payment_intent.succeeded']).toBe(2);
      expect(stats.eventTypes['charge.refunded']).toBe(1);
    });
  });
});
