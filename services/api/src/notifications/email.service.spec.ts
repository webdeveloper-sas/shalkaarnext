import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';

describe('EmailService', () => {
  let service: EmailService;
  // @ts-ignore: TS6133 - used for module setup
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                EMAIL_PROVIDER: 'mock',
                SMTP_FROM_EMAIL: 'noreply@shalkaar.com',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('Email Sending', () => {
    it('should send email in mock mode', async () => {
      const result = await service.sendEmail({
        to: 'customer@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        text: 'Test',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should reject invalid email addresses', async () => {
      const result = await service.sendEmail({
        to: 'invalid-email',
        subject: 'Test',
        html: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate required fields', async () => {
      const result = await service.sendEmail({
        to: '',
        subject: 'Test',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Notification Templates', () => {
    it('should send order placed notification', async () => {
      const orderData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        orderId: '123',
        orderNumber: 'ORD-001',
        orderDate: new Date(),
        items: [
          {
            name: 'Product 1',
            quantity: 2,
            price: 50,
            subtotal: 100,
          },
        ],
        subtotal: 100,
        tax: 10,
        shippingCost: 5,
        total: 115,
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        trackingUrl: 'https://example.com/track',
        supportEmail: 'support@example.com',
      };

      const result = await service.sendOrderPlacedNotification(
        'customer@example.com',
        orderData
      );

      expect(result.success).toBe(true);
    });

    it('should send payment success notification', async () => {
      const paymentData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        orderId: '123',
        orderNumber: 'ORD-001',
        paymentAmount: 115,
        paymentMethod: 'Visa ending in 4242',
        paymentDate: new Date(),
        transactionId: 'pi_123456',
        orderUrl: 'https://example.com/orders/123',
        supportEmail: 'support@example.com',
      };

      const result = await service.sendPaymentSuccessNotification(
        'customer@example.com',
        paymentData
      );

      expect(result.success).toBe(true);
    });

    it('should send payment failure notification', async () => {
      const paymentData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        orderId: '123',
        orderNumber: 'ORD-001',
        failureReason: 'Card declined',
        attemptedAmount: 115,
        orderUrl: 'https://example.com/orders/123',
        retryUrl: 'https://example.com/orders/123/retry',
        supportEmail: 'support@example.com',
      };

      const result = await service.sendPaymentFailureNotification(
        'customer@example.com',
        paymentData
      );

      expect(result.success).toBe(true);
    });

    it('should send order shipped notification', async () => {
      const shippingData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        orderId: '123',
        orderNumber: 'ORD-001',
        shippedDate: new Date(),
        carrier: 'FedEx',
        trackingNumber: 'FX123456789',
        trackingUrl: 'https://fedex.com/track',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        items: [
          {
            name: 'Product 1',
            quantity: 2,
          },
        ],
        shippingAddress: {
          name: 'John Doe',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        supportEmail: 'support@example.com',
      };

      const result = await service.sendOrderShippedNotification(
        'customer@example.com',
        shippingData
      );

      expect(result.success).toBe(true);
    });

    it('should send order delivered notification', async () => {
      const deliveryData = {
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        orderId: '123',
        orderNumber: 'ORD-001',
        deliveryDate: new Date(),
        items: [
          {
            name: 'Product 1',
            quantity: 2,
          },
        ],
        reviewUrl: 'https://example.com/review',
        supportEmail: 'support@example.com',
      };

      const result = await service.sendOrderDeliveredNotification(
        'customer@example.com',
        deliveryData
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Service Status', () => {
    it('should return service status', () => {
      const status = service.getStatus();

      expect(status).toHaveProperty('provider');
      expect(status).toHaveProperty('ready');
      expect(status).toHaveProperty('mode');
      expect(status.mode).toBe('mock');
    });
  });
});
