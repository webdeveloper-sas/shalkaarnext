"use client";

import type { LocalCartItem } from "@/context/CartContext";

const GST_RATE = 0.17;
const SHIPPING_THRESHOLD = 500;
const BASE_SHIPPING = 50;

interface CheckoutOrderSummaryProps {
  items: LocalCartItem[];
}

export default function CheckoutOrderSummary({
  items,
}: CheckoutOrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING;
  const gstAmount = Math.round((subtotal + shipping) * GST_RATE);
  const total = subtotal + shipping + gstAmount;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      {/* Items List */}
      <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-gray-600">Qty: {item.quantity}</p>
            </div>
            <p className="font-medium text-gray-900">
              ₹{(item.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="space-y-3 mb-6 border-b border-gray-200 pb-6">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
          <span className="font-medium">₹{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-green-600 font-semibold">Free</span>
            ) : (
              `₹${shipping.toLocaleString()}`
            )}
          </span>
        </div>

        {shipping > 0 && (
          <p className="text-xs text-gray-500 italic">
            Free shipping on orders over ₹{SHIPPING_THRESHOLD.toLocaleString()}
          </p>
        )}

        <div className="flex justify-between text-gray-700">
          <span>GST (17%)</span>
          <span className="font-medium">₹{gstAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-baseline">
        <span className="text-lg font-semibold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-purple-600">
          ₹{total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
