'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  PaymentStatus,
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse,
  PaymentValidator,
  ValidationResult,
} from '@/lib/payment-utils';

interface PaymentContextType {
  // State
  currentPayment: PaymentResponse | null;
  paymentHistory: PaymentResponse[];
  isProcessing: boolean;
  lastError: string | null;
  validationErrors: Record<string, string>;

  // Methods
  initiatePayment: (request: PaymentRequest) => Promise<PaymentResponse>;
  refundPayment: (request: RefundRequest) => Promise<RefundResponse>;
  validatePayment: (request: PaymentRequest) => ValidationResult;
  clearError: () => void;
  resetPaymentState: () => void;
  getPaymentStatus: (transactionId: string) => PaymentStatus | null;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

/**
 * Payment Provider Component
 */
export function PaymentProvider({ children }: { children: ReactNode }) {
  const [currentPayment, setCurrentPayment] = useState<PaymentResponse | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentResponse[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api/v1';

  /**
   * Validate payment request
   */
  const validatePayment = useCallback((request: PaymentRequest): ValidationResult => {
    const result = PaymentValidator.validatePaymentRequest(request);

    if (!result.isValid) {
      const errors = result.errors.reduce(
        (acc, err) => ({
          ...acc,
          [err.field]: err.message,
        }),
        {}
      );
      setValidationErrors(errors);
    } else {
      setValidationErrors({});
    }

    return result;
  }, []);

  /**
   * Initiate payment
   */
  const initiatePayment = useCallback(
    async (request: PaymentRequest): Promise<PaymentResponse> => {
      // Validate first
      const validation = validatePayment(request);
      if (!validation.isValid) {
        throw new Error('Payment validation failed');
      }

      setIsProcessing(true);
      setLastError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Payment initiation failed');
        }

        const paymentResponse: PaymentResponse = await response.json();

        // Update state
        setCurrentPayment(paymentResponse);
        setPaymentHistory((prev) => [paymentResponse, ...prev]);

        // Track analytics
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'payment_initiated', {
            transaction_id: paymentResponse.transactionId,
            amount: paymentResponse.amount,
            status: paymentResponse.status,
          });
        }

        return paymentResponse;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
        setLastError(errorMessage);

        // Track error
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'payment_error', {
            error_message: errorMessage,
          });
        }

        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [validatePayment, API_BASE_URL]
  );

  /**
   * Refund payment
   */
  const refundPayment = useCallback(
    async (request: RefundRequest): Promise<RefundResponse> => {
      setIsProcessing(true);
      setLastError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/payments/refund`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Refund failed');
        }

        const refundResponse: RefundResponse = await response.json();

        // Update payment history
        setPaymentHistory((prev) =>
          prev.map((p) =>
            p.transactionId === request.transactionId
              ? { ...p, status: PaymentStatus.REFUNDED }
              : p
          )
        );

        // Track analytics
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'payment_refunded', {
            transaction_id: request.transactionId,
            amount: request.amount,
          });
        }

        return refundResponse;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Refund failed';
        setLastError(errorMessage);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [API_BASE_URL]
  );

  /**
   * Get payment status from history
   */
  const getPaymentStatus = useCallback(
    (transactionId: string): PaymentStatus | null => {
      const payment = paymentHistory.find((p) => p.transactionId === transactionId);
      return payment?.status || null;
    },
    [paymentHistory]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  /**
   * Reset payment state
   */
  const resetPaymentState = useCallback(() => {
    setCurrentPayment(null);
    setLastError(null);
    setValidationErrors({});
    setIsProcessing(false);
  }, []);

  const value: PaymentContextType = {
    currentPayment,
    paymentHistory,
    isProcessing,
    lastError,
    validationErrors,
    initiatePayment,
    refundPayment,
    validatePayment,
    clearError,
    resetPaymentState,
    getPaymentStatus,
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

/**
 * Hook to use Payment context
 */
export function usePayment(): PaymentContextType {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
}
