"use client";

import { useState } from "react";

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutObject {
  userDetails: CheckoutFormData;
  cartItems: Array<{ productId: string; name: string; price: number; quantity: number }>;
  totals: {
    subtotal: number;
    shipping: number;
    gstAmount: number;
    total: number;
  };
  timestamp: string;
}

interface UserDetailsFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  isLoading?: boolean;
}

export default function UserDetailsForm({
  onSubmit,
  isLoading = false,
}: UserDetailsFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "India",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[0-9]{10,}$/.test(phone.replace(/\D/g, ""));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Details</h2>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 ${
            touched.fullName && errors.fullName ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={touched.fullName && !!errors.fullName}
          aria-describedby={touched.fullName && errors.fullName ? "fullName-error" : undefined}
        />
        {touched.fullName && errors.fullName && (
          <p id="fullName-error" className="text-red-600 text-sm mt-1">
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 ${
              touched.email && errors.email ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={touched.email && errors.email ? "email-error" : undefined}
          />
          {touched.email && errors.email && (
            <p id="email-error" className="text-red-600 text-sm mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            placeholder="10-digit number"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 ${
              touched.phone && errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={touched.phone && !!errors.phone}
            aria-describedby={touched.phone && errors.phone ? "phone-error" : undefined}
          />
          {touched.phone && errors.phone && (
            <p id="phone-error" className="text-red-600 text-sm mt-1">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      {/* Street Address */}
      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
          Street Address *
        </label>
        <input
          type="text"
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 ${
            touched.street && errors.street ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={touched.street && !!errors.street}
          aria-describedby={touched.street && errors.street ? "street-error" : undefined}
        />
        {touched.street && errors.street && (
          <p id="street-error" className="text-red-600 text-sm mt-1">
            {errors.street}
          </p>
        )}
      </div>

      {/* City, Postal Code, Country */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 ${
              touched.city && errors.city ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={touched.city && !!errors.city}
            aria-describedby={touched.city && errors.city ? "city-error" : undefined}
          />
          {touched.city && errors.city && (
            <p id="city-error" className="text-red-600 text-sm mt-1">
              {errors.city}
            </p>
          )}
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
            Postal Code *
          </label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 ${
              touched.postalCode && errors.postalCode ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={touched.postalCode && !!errors.postalCode}
            aria-describedby={touched.postalCode && errors.postalCode ? "postalCode-error" : undefined}
          />
          {touched.postalCode && errors.postalCode && (
            <p id="postalCode-error" className="text-red-600 text-sm mt-1">
              {errors.postalCode}
            </p>
          )}
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country *
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 ${
              touched.country && errors.country ? "border-red-500" : "border-gray-300"
            }`}
            aria-invalid={touched.country && !!errors.country}
            aria-describedby={touched.country && errors.country ? "country-error" : undefined}
          >
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
            <option value="Other">Other</option>
          </select>
          {touched.country && errors.country && (
            <p id="country-error" className="text-red-600 text-sm mt-1">
              {errors.country}
            </p>
          )}
        </div>
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
        {isLoading ? "Processing..." : "Continue to Payment"}
      </button>
    </form>
  );
}
