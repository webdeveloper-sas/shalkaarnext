/**
 * Payment Utilities and Types for Phase 12
 * Enhanced payment processing with Stripe/PayPal integration support
 */

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  PAYPAL = 'paypal',
  UPI = 'upi',
  WALLET = 'wallet',
  NET_BANKING = 'net_banking',
}

export enum TransactionType {
  PURCHASE = 'purchase',
  REFUND = 'refund',
  PARTIAL_REFUND = 'partial_refund',
  CHARGEBACK = 'chargeback',
}

/**
 * Payment Request Interface
 */
export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  email: string;
  paymentMethod: PaymentMethod;
  cardDetails?: {
    number: string;
    holderName: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  metadata?: Record<string, any>;
}

/**
 * Payment Response Interface
 */
export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  timestamp: string;
  message?: string;
  errorCode?: string;
  errorDetails?: string;
  gateway?: string; // 'stripe', 'paypal', 'mock'
}

/**
 * Refund Request Interface
 */
export interface RefundRequest {
  transactionId: string;
  amount?: number; // Partial refund if less than original
  reason: string;
  notes?: string;
}

/**
 * Refund Response Interface
 */
export interface RefundResponse {
  success: boolean;
  refundId: string;
  originalTransactionId: string;
  amount: number;
  status: PaymentStatus;
  timestamp: string;
  message?: string;
}

/**
 * Transaction Record Interface
 */
export interface Transaction {
  id: string;
  orderId: string;
  transactionId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  gateway: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Payment Validation Results
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Card Validation Utils
 */
export class CardValidator {
  /**
   * Validate card number using Luhn algorithm
   */
  static validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate expiry date format (MM/YY)
   */
  static validateExpiry(expiryDate: string): boolean {
    const [month, year] = expiryDate.split('/');
    if (!month || !year) return false;

    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (monthNum < 1 || monthNum > 12) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;

    return true;
  }

  /**
   * Validate CVV (3-4 digits)
   */
  static validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  /**
   * Validate card holder name
   */
  static validateCardHolder(name: string): boolean {
    return /^[a-zA-Z\s]{2,}$/.test(name.trim());
  }

  /**
   * Get card type from number
   */
  static getCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');

    if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cleaned)) return 'Visa';
    if (/^5[1-5][0-9]{14}$/.test(cleaned)) return 'Mastercard';
    if (/^3[47][0-9]{13}$/.test(cleaned)) return 'American Express';
    if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(cleaned)) return 'Discover';
    if (/^3(?:5[0-9]{14}|[68][0-9]{12,15})$/.test(cleaned)) return 'JCB';

    return 'Unknown';
  }
}

/**
 * Payment Validation Utils
 */
export class PaymentValidator {
  /**
   * Validate complete payment request
   */
  static validatePaymentRequest(request: PaymentRequest): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate required fields
    if (!request.orderId) {
      errors.push({ field: 'orderId', message: 'Order ID is required', code: 'MISSING_ORDER_ID' });
    }

    if (!request.amount || request.amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be greater than 0', code: 'INVALID_AMOUNT' });
    }

    if (!request.email || !this.validateEmail(request.email)) {
      errors.push({ field: 'email', message: 'Valid email is required', code: 'INVALID_EMAIL' });
    }

    // Validate card details if payment method is card
    if (request.paymentMethod === PaymentMethod.CARD && request.cardDetails) {
      const cardErrors = this.validateCardDetails(request.cardDetails);
      errors.push(...cardErrors);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate card details
   */
  static validateCardDetails(card: PaymentRequest['cardDetails']): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!card) return errors;

    // Validate card number
    if (!card.number || !CardValidator.validateCardNumber(card.number)) {
      errors.push({ field: 'cardNumber', message: 'Invalid card number', code: 'INVALID_CARD_NUMBER' });
    }

    // Validate card holder name
    if (!card.holderName || !CardValidator.validateCardHolder(card.holderName)) {
      errors.push({
        field: 'holderName',
        message: 'Card holder name must contain only letters and spaces',
        code: 'INVALID_HOLDER_NAME',
      });
    }

    // Validate expiry
    if (!card.expiryMonth || card.expiryMonth < 1 || card.expiryMonth > 12) {
      errors.push({ field: 'expiryMonth', message: 'Invalid expiry month', code: 'INVALID_EXPIRY_MONTH' });
    }

    if (!card.expiryYear) {
      errors.push({ field: 'expiryYear', message: 'Expiry year is required', code: 'INVALID_EXPIRY_YEAR' });
    }

    // Validate CVV
    if (!card.cvv || !CardValidator.validateCVV(card.cvv)) {
      errors.push({ field: 'cvv', message: 'Invalid CVV', code: 'INVALID_CVV' });
    }

    return errors;
  }

  /**
   * Validate email address
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate refund request
   */
  static validateRefundRequest(request: RefundRequest): ValidationResult {
    const errors: ValidationError[] = [];

    if (!request.transactionId) {
      errors.push({
        field: 'transactionId',
        message: 'Transaction ID is required',
        code: 'MISSING_TRANSACTION_ID',
      });
    }

    if (request.amount && request.amount <= 0) {
      errors.push({ field: 'amount', message: 'Refund amount must be greater than 0', code: 'INVALID_AMOUNT' });
    }

    if (!request.reason) {
      errors.push({ field: 'reason', message: 'Refund reason is required', code: 'MISSING_REASON' });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Payment Formatting Utils
 */
export class PaymentFormatter {
  /**
   * Format amount for display
   */
  static formatAmount(amount: number, currency: string = 'INR'): string {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    });
    return formatter.format(amount);
  }

  /**
   * Format card number (masked)
   */
  static formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  /**
   * Mask card number for display
   */
  static maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    const last4 = cleaned.slice(-4);
    return `•••• •••• •••• ${last4}`;
  }

  /**
   * Format expiry date
   */
  static formatExpiry(month: number, year: number): string {
    return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
  }

  /**
   * Format timestamp
   */
  static formatTimestamp(date: Date): string {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  /**
   * Format transaction ID
   */
  static formatTransactionId(id: string): string {
    return id.toUpperCase().replace(/-/g, '-');
  }
}

/**
 * Payment Constants
 */
export const PAYMENT_CONSTANTS = {
  // Supported payment methods
  METHODS: [PaymentMethod.CARD, PaymentMethod.UPI, PaymentMethod.WALLET],

  // Transaction timeouts (in seconds)
  TIMEOUT: 30,
  WEBHOOK_TIMEOUT: 60,

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,

  // Amount limits (in smallest currency unit)
  MIN_AMOUNT: 100, // ₹1
  MAX_AMOUNT: 10000000, // ₹100,000

  // Card limits
  CARD_RETRY_LIMIT: 3,
  CARD_LOCKOUT_DURATION: 300000, // 5 minutes

  // Refund settings
  REFUND_GRACE_PERIOD: 86400000, // 24 hours
  MAX_REFUND_PERCENTAGE: 100,
};

/**
 * Payment Status Descriptions
 */
export const PAYMENT_STATUS_DESCRIPTIONS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Payment is pending processing',
  [PaymentStatus.PROCESSING]: 'Payment is being processed',
  [PaymentStatus.SUCCESS]: 'Payment completed successfully',
  [PaymentStatus.FAILED]: 'Payment processing failed',
  [PaymentStatus.CANCELLED]: 'Payment was cancelled',
  [PaymentStatus.REFUNDED]: 'Payment has been refunded',
};
