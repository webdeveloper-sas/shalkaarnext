"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();

  const isEmpty = items.length === 0;

  const handleCheckout = () => {
    // Route to checkout page (Phase 9d)
    router.push("/checkout");
  };

  const handleContinueShopping = () => {
    router.push("/products");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
      </div>

      {isEmpty ? (
        // Empty Cart State
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
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
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some beautiful artisan products to get started
            </p>

            <button
              onClick={handleContinueShopping}
              className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        // Cart with Items
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {items.length} item{items.length !== 1 ? "s" : ""} in cart
                </h2>

                {/* Items List */}
                <div>
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>

                {/* Continue Shopping Link */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href="/products"
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>

            {/* Cart Summary Sidebar */}
            <div className="lg:col-span-1">
              <CartSummary
                subtotal={totalPrice}
                itemCount={items.length}
                onCheckout={handleCheckout}
                isCheckoutDisabled={isEmpty}
              />

              {/* Clear Cart Link */}
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to clear your cart?")) {
                    await clearCart();
                  }
                }}
                className="w-full mt-4 text-red-600 hover:text-red-700 font-medium text-sm transition-colors py-2 border-t border-gray-200"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
