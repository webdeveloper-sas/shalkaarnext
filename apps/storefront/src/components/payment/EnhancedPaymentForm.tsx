'use client';

import React, { useState, useCallback } from 'react';
import { CardValidator, PaymentFormatter, PaymentMethod } from '@/lib/payment-utils';

export interface PaymentFormData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}

interface EnhancedPaymentFormProps {
  amount: number;
  currency?: string;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  isLoading?: boolean;
  paymentMethods?: PaymentMethod[];
}

/**
 * Enhanced Payment Form Component with validation
 */
export default function EnhancedPaymentForm({
  amount,
  currency = 'INR',
  onSubmit,
  isLoading = false,
  paymentMethods = [PaymentMethod.CARD],
}: EnhancedPaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(paymentMethods[0]);
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [cardType, setCardType] = useState<string>('');

  /**
   * Handle card number change
   */
  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');

    // Allow only digits
    value = value.replace(/\D/g, '');

    // Format with spaces every 4 digits
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();

    setFormData((prev) => ({ ...prev, cardNumber: formatted }));

    // Detect card type
    if (value) {
      setCardType(CardValidator.getCardType(value));
    }

    // Clear error on change
    if (errors.cardNumber) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.cardNumber;
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Handle expiry date change
   */
  const handleExpiryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }

    setFormData((prev) => ({ ...prev, expiryDate: value }));

    // Clear error on change
    if (errors.expiryDate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.expiryDate;
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Handle CVV change
   */
  const handleCVVChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData((prev) => ({ ...prev, cvv: value }));

    // Clear error on change
    if (errors.cvv) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.cvv;
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Handle cardholder name change
   */
  const handleCardNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, cardName: value }));

    // Clear error on change
    if (errors.cardName) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.cardName;
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Validate form
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate card number
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!CardValidator.validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Validate cardholder name
    if (!formData.cardName) {
      newErrors.cardName = 'Cardholder name is required';
    } else if (!CardValidator.validateCardHolder(formData.cardName)) {
      newErrors.cardName = 'Name must contain only letters and spaces';
    }

    // Validate expiry
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!CardValidator.validateExpiry(formData.expiryDate)) {
      newErrors.expiryDate = 'Card has expired or invalid format (MM/YY)';
    }

    // Validate CVV
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!CardValidator.validateCVV(formData.cvv)) {
      newErrors.cvv = 'Invalid CVV (3-4 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Payment submission error:', error);
      }
    },
    [formData, onSubmit, validateForm]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      {paymentMethods.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setSelectedMethod(method)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedMethod === method
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 bg-white hover:border-purple-300'
                }`}
              >
                <span className="block text-sm font-medium text-gray-900 capitalize">
                  {method.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card Number */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-900">
            Card Number
          </label>
          {cardType && (
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
              {cardType}
            </span>
          )}
        </div>
        <input
          id="cardNumber"
          type="text"
          placeholder="1234 5678 9012 3456"
          value={formData.cardNumber}
          onChange={handleCardNumberChange}
          onBlur={() => handleBlur('cardNumber')}
          maxLength={19}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.cardNumber && touched.cardNumber
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-purple-500'
          }`}
        />
        {errors.cardNumber && touched.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
        )}
      </div>

      {/* Cardholder Name */}
      <div>
        <label htmlFor="cardName" className="block text-sm font-medium text-gray-900 mb-2">
          Cardholder Name
        </label>
        <input
          id="cardName"
          type="text"
          placeholder="John Doe"
          value={formData.cardName}
          onChange={handleCardNameChange}
          onBlur={() => handleBlur('cardName')}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.cardName && touched.cardName
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-purple-500'
          }`}
        />
        {errors.cardName && touched.cardName && (
          <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>
        )}
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium text-gray-900 mb-2">
            Expiry Date
          </label>
          <input
            id="expiry"
            type="text"
            placeholder="MM/YY"
            value={formData.expiryDate}
            onChange={handleExpiryChange}
            onBlur={() => handleBlur('expiryDate')}
            maxLength={5}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.expiryDate && touched.expiryDate
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-purple-500'
            }`}
          />
          {errors.expiryDate && touched.expiryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-900 mb-2">
            CVV
          </label>
          <input
            id="cvv"
            type="text"
            placeholder="123"
            value={formData.cvv}
            onChange={handleCVVChange}
            onBlur={() => handleBlur('cvv')}
            maxLength={4}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.cvv && touched.cvv
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-purple-500'
            }`}
          />
          {errors.cvv && touched.cvv && (
            <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
          )}
        </div>
      </div>

      {/* Save Card Checkbox */}
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.saveCard}
          onChange={(e) => setFormData((prev) => ({ ...prev, saveCard: e.target.checked }))}
          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <span className="text-sm text-gray-700">Save this card for future purchases</span>
      </label>

      {/* Amount Display */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Total Amount to Pay</p>
        <p className="text-2xl font-bold text-purple-600">
          {PaymentFormatter.formatAmount(amount, currency)}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center space-x-2">
            <span className="inline-block animate-spin">⏳</span>
            <span>Processing Payment...</span>
          </span>
        ) : (
          `Pay ${PaymentFormatter.formatAmount(amount, currency)}`
        )}
      </button>

      {/* Security Info */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
        <span>🔒</span>
        <span>Secure SSL Encryption - Your card data is safe</span>
      </div>
    </form>
  );
}
