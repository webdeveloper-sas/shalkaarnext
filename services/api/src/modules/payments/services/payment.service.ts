import { Injectable } from '@nestjs/common';

export interface PaymentInitiationRequest {
  orderId: string;
  amount: number;
  currency: string;
  email: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
}

@Injectable()
export class PaymentService {
  /**
   * Mock payment gateway integration
   * Simulates payment processing with 80% success rate
   * In production, integrate with Stripe, PayPal, Razorpay, etc.
   */
  async processPayment(request: PaymentInitiationRequest): Promise<PaymentResult> {
    const { orderId, amount } = request;

    // Simulate payment processing delay
    await this.delay(500);

    // Mock: 80% success rate for demo purposes
    const isSuccessful = Math.random() < 0.8;

    if (isSuccessful) {
      const transactionId = `TXN-${orderId}-${Date.now()}`;
      return {
        success: true,
        transactionId,
        message: `Payment of ${amount} processed successfully`,
      };
    } else {
      return {
        success: false,
        message: 'Payment declined - please try another card',
      };
    }
  }

  /**
   * Simulate webhook callback from payment gateway
   * In production, this would be triggered by the gateway
   */
  async webhookPaymentConfirmed(transactionId: string): Promise<boolean> {
    // Validate transaction and mark order as paid
    return !!(transactionId && transactionId.startsWith('TXN-'));
  }

  /**
   * Simulate refund processing
   */
  async refundPayment(transactionId: string, amount: number): Promise<PaymentResult> {
    await this.delay(300);

    return {
      success: true,
      transactionId: `REFUND-${transactionId}-${Date.now()}`,
      message: `Refund of ${amount} processed successfully`,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
