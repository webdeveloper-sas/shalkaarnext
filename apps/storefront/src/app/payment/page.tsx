"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { usePayment } from "@/context/PaymentContext";
import { useOrder } from "@/context/OrderContext";
import EnhancedPaymentForm from "@/components/payment/EnhancedPaymentForm";
import PaymentStatus from "@/components/payment/PaymentStatus";
import CheckoutOrderSummary from "@/components/checkout/CheckoutOrderSummary";
import type { CheckoutObject } from "@/components/checkout/UserDetailsForm";
import type { PaymentRequest } from "@/lib/payment-utils";
import { PaymentMethod } from "@/lib/payment-utils";

const CHECKOUT_STORAGE_KEY = "shalkaar_checkout";

interface OrderData {
  userId: string;
  items: Array<{ productId: string; productName: string; quantity: number; price: number }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  email: string;
  phone?: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { initiatePayment, isProcessing, lastError } = usePayment();
  const { createOrder } = useOrder();
  
  const [checkoutData, setCheckoutData] = useState<CheckoutObject | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Load checkout data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (saved) {
      try {
        setCheckoutData(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse checkout data:", error);
        setErrorMessage("Failed to load checkout information");
      }
    }
  }, []);

  // Redirect if no cart items or checkout data
  useEffect(() => {
    if (items.length === 0 && !checkoutData) {
      router.push("/cart");
    }
  }, [items.length, checkoutData, router]);

  // Handle payment context errors
  useEffect(() => {
    if (lastError && paymentStatus === "processing") {
      setErrorMessage(lastError);
      setPaymentStatus("error");
    }
  }, [lastError, paymentStatus]);

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!checkoutData) {
      setErrorMessage("Checkout information not found");
      return;
    }

    setPaymentStatus("processing");
    setErrorMessage(null);

    try {
      // Prepare payment request
      const paymentRequest: PaymentRequest = {
        orderId: `ORD-${Date.now()}`, // Temporary order ID
        amount: checkoutData.totals.total,
        email: checkoutData.userDetails.email,
        currency: "USD",
        paymentMethod: PaymentMethod.CARD,
        cardDetails: {
          number: paymentData.cardNumber.replace(/\s/g, ""),
          holderName: paymentData.cardName,
          expiryMonth: parseInt(paymentData.expiryDate.split("/")[0]),
          expiryYear: parseInt(`20${paymentData.expiryDate.split("/")[1]}`),
          cvv: paymentData.cvv,
        },
        billingAddress: {
          street: checkoutData.userDetails.street,
          city: checkoutData.userDetails.city,
          state: "",
          postalCode: checkoutData.userDetails.postalCode,
          country: checkoutData.userDetails.country || "IN",
        },
      };

      // Initiate payment via context
      const paymentResponse = await initiatePayment(paymentRequest);

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || "Payment processing failed");
      }

      // Create order in database with transaction ID
      const orderData: OrderData = {
        userId: "guest", // In real app, get from auth context
        items: checkoutData.cartItems.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          street: checkoutData.userDetails.street,
          city: checkoutData.userDetails.city,
          state: "",
          postalCode: checkoutData.userDetails.postalCode,
          country: checkoutData.userDetails.country || "IN",
        },
        email: checkoutData.userDetails.email,
        phone: checkoutData.userDetails.phone,
        subtotal: checkoutData.totals.subtotal,
        tax: checkoutData.totals.gstAmount,
        shippingCost: checkoutData.totals.shipping,
        discount: 0,
        total: checkoutData.totals.total,
      };

      // Create order via context
      const newOrder = await createOrder(orderData);

      // Clear cart and localStorage
      await clearCart();
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);

      // Store order ID and redirect
      setOrderId(newOrder.id);
      setPaymentStatus("success");

      // Redirect to confirmation after 2 seconds
      setTimeout(() => {
        router.push(`/confirmation?orderId=${newOrder.id}`);
      }, 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Payment processing failed";
      console.error("Payment error:", error);
      setErrorMessage(errorMsg);
      setPaymentStatus("error");
    }
  };

  const handleRetry = () => {
    setPaymentStatus("idle");
    setErrorMessage(null);
    setOrderId(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Section */}
          <div className="lg:col-span-2">
            {/* Status Messages */}
            {(paymentStatus === "processing" || paymentStatus === "success" || paymentStatus === "error") && (
              <div className="mb-6">
                <PaymentStatus
                  isLoading={paymentStatus === "processing"}
                  isSuccess={paymentStatus === "success"}
                  isError={paymentStatus === "error"}
                  errorMessage={errorMessage || undefined}
                  orderId={orderId || undefined}
                />
              </div>
            )}

            {/* Payment Form */}
            {paymentStatus === "idle" && checkoutData && (
              <div className="bg-white rounded-lg">
                <EnhancedPaymentForm
                  amount={checkoutData.totals.total}
                  currency="INR"
                  onSubmit={handlePaymentSubmit}
                  isLoading={isProcessing}
                />
              </div>
            )}

            {/* Error Retry */}
            {paymentStatus === "error" && (
              <div className="space-y-4">
                <button
                  onClick={handleRetry}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold"
                >
                  Try Again
                </button>
                <Link
                  href="/checkout"
                  className="block w-full text-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  Back to Checkout
                </Link>
              </div>
            )}

            {/* Success Navigation */}
            {paymentStatus === "success" && (
              <div className="text-center text-gray-600 mt-6">
                <p>Redirecting to confirmation page...</p>
              </div>
            )}
          </div>

          {/* Summary Section */}
          {checkoutData && (
            <div className="lg:col-span-1">
              <CheckoutOrderSummary items={checkoutData.cartItems.map((item) => ({
                id: item.productId,
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              }))} />

              {/* Payment Info */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 text-sm">
                <h3 className="font-semibold text-gray-900">Shipping To</h3>
                <div className="text-gray-600 space-y-1">
                  <p>{checkoutData.userDetails.fullName}</p>
                  <p>{checkoutData.userDetails.street}</p>
                  <p>{checkoutData.userDetails.city} {checkoutData.userDetails.postalCode}</p>
                  <p>{checkoutData.userDetails.country}</p>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                <p className="font-semibold mb-1">🔒 Your payment is secure</p>
                <p>We use industry-standard SSL encryption to protect your information.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
