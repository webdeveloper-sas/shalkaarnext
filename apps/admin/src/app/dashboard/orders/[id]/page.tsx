'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerPhone?: string;
  status: string;
  paymentStatus: string;
  transactionId: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  /**
   * Fetch order details
   */
  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api/v1'}/orders/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await response.json();
        setOrder(data);
        setNewStatus(data.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  /**
   * Handle status update
   */
  const handleStatusUpdate = async () => {
    if (!order || !newStatus || newStatus === order.status) return;

    setIsUpdatingStatus(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api/v1'}/orders/${params.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/orders"
            className="text-brand-indigo hover:text-brand-purple font-medium mb-2 inline-block"
          >
            ← Back to Orders
          </Link>
          <h1 className="text-4xl font-serif font-bold text-brand-indigo">
            Order {order.orderNumber}
          </h1>
        </div>
        <span
          className={`inline-block px-4 py-2 rounded-full font-medium ${getStatusColor(
            order.status
          )}`}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{order.customerEmail}</p>
              </div>
              {order.customerPhone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{order.customerPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <p className="text-gray-900">{order.shippingAddress.street}</p>
              <p className="text-gray-900">
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Product</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Quantity</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Price</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 text-gray-900">{item.productName}</td>
                      <td className="px-6 py-4 text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 text-gray-900">₹{item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <aside className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
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
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-brand-indigo">₹{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Info</h2>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>
            {order.transactionId && (
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-mono text-xs text-gray-900 break-all">{order.transactionId}</p>
              </div>
            )}
          </div>

          {/* Status Update */}
          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-indigo"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdatingStatus || newStatus === order.status}
              className="w-full px-4 py-2 bg-brand-indigo text-white rounded-lg font-medium hover:bg-brand-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingStatus ? 'Updating...' : 'Update Status'}
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              📧 Send Email
            </button>
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              🖨️ Print Invoice
            </button>
            {order.paymentStatus.toLowerCase() === 'completed' && (
              <button className="w-full px-4 py-2 border border-red-300 rounded-lg text-red-700 font-medium hover:bg-red-50 transition-colors">
                💰 Refund Order
              </button>
            )}
          </div>

          {/* Order Date */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="mb-1">Order Created</p>
            <p className="font-medium text-gray-900">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
