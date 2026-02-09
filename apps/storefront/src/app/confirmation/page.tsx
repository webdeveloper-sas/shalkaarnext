"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useOrder, Order } from "@/context/OrderContext";
import OrderConfirmation from "@/components/OrderConfirmation";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { fetchOrderById } = useOrder();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(!!orderId);
  const [error, setError] = useState<string | null>(null);
  const [showAnimation] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        const fetchedOrder = await fetchOrderById(orderId);
        setOrder(fetchedOrder as Order);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load order details";
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId, fetchOrderById]);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">No order ID was provided</p>
            <Link
              href="/"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">We couldn't find your order</p>
            <Link
              href="/"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Order Confirmation Component */}
        <OrderConfirmation order={order} showAnimation={showAnimation} />

        {/* Additional Actions */}
        <div className="mt-12 space-y-6">
          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-semibold mt-1">✓</span>
                <span>You will receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-semibold mt-1">✓</span>
                <span>Order will be shipped within 2-3 business days</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-semibold mt-1">✓</span>
                <span>You'll receive tracking information via email</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-semibold mt-1">✓</span>
                <span>30-day return policy applies to all items</span>
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-brand-indigo text-white text-center px-6 py-3 rounded-lg hover:bg-brand-purple font-semibold transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="block w-full border-2 border-brand-indigo text-brand-indigo text-center px-6 py-3 rounded-lg hover:bg-brand-indigo hover:bg-opacity-5 font-semibold transition-colors"
            >
              View Your Orders
            </Link>
          </div>

          {/* Support */}
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>Have questions? Contact our support team</p>
            <p className="font-medium text-gray-900">support@shalkaar.com | +91-9876-543-210</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
