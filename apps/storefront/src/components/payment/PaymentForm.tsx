"use client";

import { useState } from "react";

export interface PaymentData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

interface PaymentFormProps {
  onSubmit: (data: PaymentData) => void;
  isLoading?: boolean;
}

export default function PaymentForm({
  onSubmit,
  isLoading = false,
}: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentData>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateCardNumber = (num: string) => {
    return /^\d{16}$/.test(num.replace(/\s/g, ""));
  };

  const validateExpiry = (date: string) => {
    return /^\d{2}\/\d{2}$/.test(date);
  };

  const validateCVV = (cvv: string) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (!validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number";
    }

    if (!formData.cardName.trim()) {
      newErrors.cardName = "Cardholder name is required";
    }

    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    } else if (!validateExpiry(formData.expiryDate)) {
      newErrors.expiryDate = "Please enter date as MM/YY";
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = "CVV is required";
    } else if (!validateCVV(formData.cvv)) {
      newErrors.cvv = "Please enter a valid 3-4 digit CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    // Format card number with spaces
    if (name === "cardNumber") {
      value = value.replace(/\s/g, "").slice(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    }

    // Format expiry date
    if (name === "expiryDate") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2);
      }
    }

    // Format CVV
    if (name === "cvv") {
      value = value.replace(/\D/g, "").slice(0, 4);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h2>
        <p className="text-sm text-gray-600 mb-4">
          This is a secure mock payment gateway for testing. Use any valid 16-digit number.
        </p>
      </div>

      {/* Cardholder Name */}
      <div>
        <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
          Cardholder Name *
        </label>
        <input
          type="text"
          id="cardName"
          name="cardName"
          value={formData.cardName}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 ${
            touched.cardName && errors.cardName ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={touched.cardName && !!errors.cardName}
          aria-describedby={touched.cardName && errors.cardName ? "cardName-error" : undefined}
        />
        {touched.cardName && errors.cardName && (
          <p id="cardName-error" className="text-red-600 text-sm mt-1">
            {errors.cardName}
          </p>
        )}
      </div>

      {/* Card Number */}
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Card Number *
        </label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-mono ${
            touched.cardNumber && errors.cardNumber ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={touched.cardNumber && !!errors.cardNumber}
          aria-describedby={touched.cardNumber && errors.cardNumber ? "cardNumber-error" : undefined}
        />
        {touched.cardNumber && errors.cardNumber && (
          <p id="cardNumber-error" className="text-red-600 text-sm mt-1">
            {errors.cardNumber}
          </p>
        )}
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-6">
        {/* Expiry Date */}
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date *
          </label>
          <input
            type="text"
            id="expiryDate"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            placeholder="MM/YY"
            maxLength={5}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-mono ${
              touched.expiryDate && errors.expiryDate ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={touched.expiryDate && !!errors.expiryDate}
            aria-describedby={touched.expiryDate && errors.expiryDate ? "expiryDate-error" : undefined}
          />
          {touched.expiryDate && errors.expiryDate && (
            <p id="expiryDate-error" className="text-red-600 text-sm mt-1">
              {errors.expiryDate}
            </p>
          )}
        </div>

        {/* CVV */}
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
            CVV *
          </label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            value={formData.cvv}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            placeholder="123"
            maxLength={4}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-mono ${
              touched.cvv && errors.cvv ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={touched.cvv && !!errors.cvv}
            aria-describedby={touched.cvv && errors.cvv ? "cvv-error" : undefined}
          />
          {touched.cvv && errors.cvv && (
            <p id="cvv-error" className="text-red-600 text-sm mt-1">
              {errors.cvv}
            </p>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-semibold mb-2">🔒 Secure Payment</p>
        <p className="text-xs">
          Your payment information is encrypted and never stored on our servers. This is a mock gateway for testing purposes.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
          isLoading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700 active:scale-95"
        }`}
      >
        {isLoading ? "Processing Payment..." : "Pay Now"}
      </button>
    </form>
  );
}
