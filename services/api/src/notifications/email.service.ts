import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Mock transporter interface for stub implementation
interface Transporter {
  sendMail: (options: any) => Promise<any>;
  verify?: () => Promise<void>;
}

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email Service
 * Handles all email sending operations
 * Supports both SMTP and mock providers
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private isMockMode = false;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const emailProvider = this.configService.get<string>(
      'EMAIL_PROVIDER',
      'mock'
    );

    if (emailProvider === 'mock') {
      this.isMockMode = true;
      this.logger.warn('Email service running in MOCK mode - no emails will be sent');
      return;
    }

    if (emailProvider === 'smtp') {
      const smtpHost = this.configService.get<string>('SMTP_HOST');
      const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
      const smtpUser = this.configService.get<string>('SMTP_USER');
      const smtpPass = this.configService.get<string>('SMTP_PASS');
      const smtpSecure = this.configService.get<boolean>('SMTP_SECURE', false);

      if (!smtpHost || !smtpUser || !smtpPass) {
        this.logger.error(
          'SMTP configuration incomplete. Email service falling back to mock mode.'
        );
        this.isMockMode = true;
        return;
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodemailer = require('nodemailer');
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        this.logger.log(
          `Email service initialized with SMTP provider: ${smtpHost}:${smtpPort}`
        );
      } catch (error) {
        this.logger.error('Failed to initialize SMTP transporter', error);
        this.isMockMode = true;
      }
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    const { to, subject, html, text, from } = options;

    // Validate email address
    if (!this.isValidEmail(to)) {
      this.logger.error(`Invalid email address: ${to}`);
      return {
        success: false,
        error: 'Invalid email address',
      };
    }

    // Mock mode - log but don't send
    if (this.isMockMode) {
      this.logger.log(`[MOCK] Email to ${to} - Subject: ${subject}`);
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    }

    // Ensure transporter is initialized
    if (!this.transporter) {
      this.logger.error('Email transporter not initialized');
      return {
        success: false,
        error: 'Email transporter not available',
      };
    }

    try {
      const result = await this.transporter.sendMail({
        from: from || this.configService.get<string>(
          'SMTP_FROM_EMAIL',
          'noreply@shalkaar.com'
        ),
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`Email sent successfully to ${to} (Message ID: ${result.messageId})`);
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${to}`, errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send order placed notification
   */
  async sendOrderPlacedNotification(
    email: string,
    orderData: any
  ): Promise<EmailResult> {
    const { renderOrderPlacedHTML, renderOrderPlacedText } = await import(
      './templates/order-placed.template'
    );

    return this.sendEmail({
      to: email,
      subject: `Order Confirmation #${orderData.orderNumber}`,
      html: renderOrderPlacedHTML(orderData),
      text: renderOrderPlacedText(orderData),
    });
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccessNotification(
    email: string,
    paymentData: any
  ): Promise<EmailResult> {
    const { renderPaymentSuccessHTML, renderPaymentSuccessText } = await import(
      './templates/payment-success.template'
    );

    return this.sendEmail({
      to: email,
      subject: `Payment Received - Order #${paymentData.orderNumber}`,
      html: renderPaymentSuccessHTML(paymentData),
      text: renderPaymentSuccessText(paymentData),
    });
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailureNotification(
    email: string,
    paymentData: any
  ): Promise<EmailResult> {
    const { renderPaymentFailedHTML, renderPaymentFailedText } = await import(
      './templates/payment-failed.template'
    );

    return this.sendEmail({
      to: email,
      subject: `Payment Failed - Order #${paymentData.orderNumber}`,
      html: renderPaymentFailedHTML(paymentData),
      text: renderPaymentFailedText(paymentData),
    });
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShippedNotification(
    email: string,
    shippingData: any
  ): Promise<EmailResult> {
    const { renderOrderShippedHTML, renderOrderShippedText } = await import(
      './templates/order-shipped.template'
    );

    return this.sendEmail({
      to: email,
      subject: `Your Order Has Shipped #${shippingData.orderNumber}`,
      html: renderOrderShippedHTML(shippingData),
      text: renderOrderShippedText(shippingData),
    });
  }

  /**
   * Send order delivered notification
   */
  async sendOrderDeliveredNotification(
    email: string,
    deliveryData: any
  ): Promise<EmailResult> {
    const { renderOrderDeliveredHTML, renderOrderDeliveredText } = await import(
      './templates/order-delivered.template'
    );

    return this.sendEmail({
      to: email,
      subject: `Order Delivered #${deliveryData.orderNumber}`,
      html: renderOrderDeliveredHTML(deliveryData),
      text: renderOrderDeliveredText(deliveryData),
    });
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    if (this.isMockMode) {
      this.logger.log('Email service in mock mode');
      return true;
    }

    if (!this.transporter) {
      this.logger.error('Email transporter not initialized');
      return false;
    }

    try {
      if (!this.transporter) {
        this.logger.warn('Email transporter not initialized');
        return false;
      }
      if (this.transporter.verify) {
        await this.transporter.verify();
      }
      this.logger.log('Email service connection verified');
      return true;
    } catch (error) {
      this.logger.error('Email service connection verification failed', error);
      return false;
    }
  }

  /**
   * Get email service status
   */
  getStatus(): {
    provider: string;
    ready: boolean;
    mode: string;
  } {
    return {
      provider: this.configService.get<string>('EMAIL_PROVIDER', 'mock'),
      ready: this.transporter !== null || this.isMockMode,
      mode: this.isMockMode ? 'mock' : 'production',
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
