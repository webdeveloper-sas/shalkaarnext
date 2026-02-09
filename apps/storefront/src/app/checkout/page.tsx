"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import UserDetailsForm, { type CheckoutFormData, type CheckoutObject } from "@/components/checkout/UserDetailsForm";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";

const CHECKOUT_STORAGE_KEY = "shalkaar_checkout";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to cart if empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Please add items before checkout</p>
            <Link
              href="/cart"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const calculateTotals = () => {
    const GST_RATE = 0.17;
    const SHIPPING_THRESHOLD = 500;
    const BASE_SHIPPING = 50;

    const subtotal = totalPrice;
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING;
    const gstAmount = Math.round((subtotal + shipping) * GST_RATE);
    const total = subtotal + shipping + gstAmount;

    return { subtotal, shipping, gstAmount, total };
  };

  const handleSubmit = async (formData: CheckoutFormData) => {
    setIsProcessing(true);
    setError(null);

    try {
      const totals = calculateTotals();

      // Prepare checkout object
      const checkoutObject: CheckoutObject = {
        userDetails: formData,
        cartItems: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totals,
        timestamp: new Date().toISOString(),
      };

      // Store checkout object in localStorage for Phase 9e
      localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkoutObject));

      // Route to payment page (Phase 9e)
      router.push("/payment");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium">Error: {error}</p>
              </div>
            )}

            {/* Form */}
            <div className="bg-white rounded-lg">
              <UserDetailsForm onSubmit={handleSubmit} isLoading={isProcessing} />
            </div>

            {/* Back to Cart Link */}
            <div className="mt-6">
              <Link
                href="/cart"
                className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
              >
                ← Back to Cart
              </Link>
            </div>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <CheckoutOrderSummary items={items} />

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <p className="font-semibold mb-2">Secure Checkout</p>
              <p className="text-xs leading-relaxed">
                Your payment information is secured using industry-standard encryption. We never store your credit card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
