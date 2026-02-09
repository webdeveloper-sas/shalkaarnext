'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/context/OrderContext';

interface OrderConfirmationProps {
  order: Order;
  showAnimation?: boolean;
}

/**
 * Order Confirmation Component
 */
export default function OrderConfirmation({
  order,
  showAnimation = true,
}: OrderConfirmationProps) {
  const [isAnimating, setIsAnimating] = useState(showAnimation);

  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => setIsAnimating(false), 1500);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [showAnimation]);

  /**
   * Get status color
   */
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return 'bg-green-50 border-green-200 text-green-700';
      case OrderStatus.PROCESSING:
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case OrderStatus.SHIPPED:
        return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case OrderStatus.DELIVERED:
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case OrderStatus.CANCELLED:
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return '✓';
      case OrderStatus.PROCESSING:
        return '⏳';
      case OrderStatus.SHIPPED:
        return '📦';
      case OrderStatus.DELIVERED:
        return '✅';
      case OrderStatus.CANCELLED:
        return '✗';
      default:
        return '•';
    }
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status: OrderStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        {isAnimating && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 animate-bounce">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your order has been confirmed</p>
          </div>
        )}

        {/* Confirmation Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Header */}
          <div className="border-b pb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmation</h2>
            <p className="text-gray-600">Order Number: <span className="font-mono font-semibold">{order.orderNumber}</span></p>
            <p className="text-sm text-gray-500">
              Order Date: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Status Card */}
          <div className={`border rounded-lg p-4 ${getStatusColor(order.status)}`}>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getStatusIcon(order.status)}</span>
              <div>
                <p className="font-semibold">Order Status</p>
                <p className="text-sm">{getStatusLabel(order.status)}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center space-x-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            {order.shippingCost > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>₹{order.shippingCost.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Tax (GST)</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-green-600">₹{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900 mb-2">Delivery To:</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 mb-2">
              <span className="font-semibold">Order Updates:</span> We'll send updates to{' '}
              <span className="font-mono">{order.customerEmail}</span>
            </p>
            {order.customerPhone && (
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Phone:</span> {order.customerPhone}
              </p>
            )}
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-900">
                <span className="font-semibold">Tracking Number:</span> {order.trackingNumber}
              </p>
            </div>
          )}

          {/* Estimated Delivery */}
          {order.estimatedDelivery && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                <span className="font-semibold">Estimated Delivery:</span>{' '}
                {new Date(order.estimatedDelivery).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Transaction ID */}
          {order.transactionId && (
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 font-mono">
              <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
              <p className="break-all">{order.transactionId}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t pt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/account"
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium text-center hover:bg-purple-700 transition-colors"
            >
              View All Orders
            </Link>
            <Link
              href="/"
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Help Section */}
          <div className="border-t pt-6 bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-3">Questions about your order?</p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                📧 Email: <span className="font-mono text-blue-600">support@shalkaar.com</span>
              </p>
              <p className="text-gray-700">
                📱 Call: <span className="font-mono text-blue-600">1-800-SHALKAAR</span>
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-8 bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h3>
          <p className="text-gray-600 mb-4">Subscribe to our newsletter for exclusive offers</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
