"use client";

import Link from "next/link";

export interface Order {
  id: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
  transactionId?: string;
}

interface OrderHistoryListProps {
  orders: Order[];
  isLoading?: boolean;
}

export default function OrderHistoryList({
  orders,
  isLoading = false,
}: OrderHistoryListProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
        <svg
          className="h-12 w-12 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <p className="text-gray-600 font-medium mb-2">No orders yet</p>
        <p className="text-gray-500 text-sm mb-4">Start shopping to create your first order</p>
        <Link
          href="/products"
          className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Order ID */}
            <div>
              <p className="text-xs text-gray-600 mb-1">Order ID</p>
              <p className="font-mono text-sm font-semibold text-gray-900">{order.id}</p>
            </div>

            {/* Date */}
            <div>
              <p className="text-xs text-gray-600 mb-1">Date</p>
              <p className="text-sm text-gray-900">
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  order.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : order.status === "processing"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "shipped"
                    ? "bg-blue-100 text-blue-700"
                    : order.status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>

            {/* Total */}
            <div>
              <p className="text-xs text-gray-600 mb-1">Total</p>
              <p className="text-sm font-bold text-gray-900">
                ₹{order.total.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Items Count */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {order.itemCount} item{order.itemCount !== 1 ? "s" : ""} • Click to view details
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
