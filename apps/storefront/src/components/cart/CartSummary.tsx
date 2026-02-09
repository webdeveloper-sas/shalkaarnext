"use client";

const GST_RATE = 0.17; // 17% GST
const SHIPPING_THRESHOLD = 500; // Free shipping over ₹500
const BASE_SHIPPING = 50; // ₹50 base shipping

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onCheckout: () => void;
  isCheckoutDisabled?: boolean;
}

export default function CartSummary({
  subtotal,
  itemCount,
  onCheckout,
  isCheckoutDisabled = false,
}: CartSummaryProps) {
  // Calculate shipping
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING;

  // Calculate GST on subtotal + shipping
  const gstAmount = Math.round((subtotal + shipping) * GST_RATE);

  // Calculate total
  const total = subtotal + shipping + gstAmount;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

      {/* Breakdown */}
      <div className="space-y-3 mb-6 border-b border-gray-200 pb-6">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})</span>
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
      <div className="flex justify-between items-baseline mb-6">
        <span className="text-lg font-semibold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-purple-600">
          ₹{total.toLocaleString()}
        </span>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={isCheckoutDisabled}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
          isCheckoutDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700 active:scale-95"
        }`}
        aria-label="Proceed to checkout"
      >
        {isCheckoutDisabled ? "Cart is Empty" : "Proceed to Checkout"}
      </button>

      {/* Info Text */}
      <div className="mt-6 space-y-2 text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
        <p className="flex items-center gap-2">
          <span>✓</span> Secure checkout
        </p>
        <p className="flex items-center gap-2">
          <span>✓</span> 30-day return policy
        </p>
        <p className="flex items-center gap-2">
          <span>✓</span> Authentic guarantee
        </p>
      </div>
    </div>
  );
}
