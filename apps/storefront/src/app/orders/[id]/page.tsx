"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3333/api/v1";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  gstAmount: number;
  items: OrderItem[];
  userDetails: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  transactionId?: string;
}

function OrderDetailContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        } else if (response.status === 404) {
          setError("Order not found");
        } else {
          setError("Failed to load order details");
        }
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
        <p className="text-red-700 mb-4">{error}</p>
        <Link href="/account" className="text-purple-600 hover:text-purple-700 font-medium">
          ← Back to Account
        </Link>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const orderDate = new Date(order.createdAt);
  const statusColor = {
    confirmed: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }[order.status.toLowerCase()] || "bg-gray-100 text-gray-800";

  return (
    <div className="space-y-8">
      {/* Order Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-2xl font-mono font-bold text-gray-900">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order Date</p>
            <p className="text-gray-900">
              {orderDate.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {orderDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
            <p className="text-gray-900 font-mono">
              {order.transactionId || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-4 border-b border-gray-200 last:border-0"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right ml-4">
                <p className="font-medium text-gray-900">₹{item.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 max-w-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-3 text-sm border-b border-gray-200 pb-4 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">₹{order.shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST (17%)</span>
            <span className="text-gray-900">₹{order.gstAmount.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between mb-6">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-xl text-purple-600">₹{order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Delivery Address</h3>
        <div className="space-y-2 text-gray-700">
          <p className="font-medium">{order.userDetails.fullName}</p>
          <p>{order.userDetails.street}</p>
          <p>
            {order.userDetails.city}, {order.userDetails.postalCode}
          </p>
          <p>{order.userDetails.country}</p>
          <div className="pt-4 border-t border-gray-200 mt-4">
            <p className="text-sm text-gray-600 mb-1">Contact Email</p>
            <p className="font-mono text-sm">{order.userDetails.email}</p>
            <p className="text-sm text-gray-600 mb-1 mt-3">Contact Phone</p>
            <p className="font-mono text-sm">{order.userDetails.phone}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/account"
          className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center"
        >
          ← Back to Orders
        </Link>
        <Link
          href="/products"
          className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Suspense fallback={<div>Loading...</div>}>
          <OrderDetailContent orderId={orderId} />
        </Suspense>
      </div>
    </div>
  );
}
