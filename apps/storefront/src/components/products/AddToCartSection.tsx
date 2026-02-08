"use client";

import { useState } from "react";
import type { Product } from "@/lib/api";
import { useCart } from "@/context/CartContext";

interface AddToCartSectionProps {
  product: Product;
}

export default function AddToCartSection({ product }: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { addToCart } = useCart();

  const inStock = product.stock && product.stock > 0;
  const maxQuantity = product.stock || 0;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(parseInt(e.target.value) || 1, maxQuantity));
    setQuantity(value);
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!inStock) {
      setMessage({ type: "error", text: "This product is out of stock" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await addToCart(product, quantity);
      setMessage({
        type: "success",
        text: `Added ${quantity} item${quantity > 1 ? "s" : ""} to cart`,
      });
      setQuantity(1);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to add to cart";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-900 mb-2">
          Quantity
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={handleDecrement}
            disabled={quantity <= 1 || !inStock}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={handleQuantityChange}
            disabled={!inStock}
            className="flex-1 text-center font-medium py-2 disabled:opacity-50"
            aria-label="Product quantity"
          />
          <button
            onClick={handleIncrement}
            disabled={quantity >= maxQuantity || !inStock}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        {inStock && (
          <p className="text-sm text-gray-500 mt-2">
            {maxQuantity - quantity} of {maxQuantity} available
          </p>
        )}
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={!inStock || isLoading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
          inStock && !isLoading
            ? "bg-purple-600 hover:bg-purple-700 active:scale-95"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        aria-label={inStock ? "Add to cart" : "Out of stock"}
      >
        {isLoading ? "Adding to cart..." : inStock ? "Add to Cart" : "Out of Stock"}
      </button>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
          role="alert"
        >
          {message.type === "success" ? "✓ " : "✗ "}
          {message.text}
        </div>
      )}

      {/* Additional Info */}
      <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p>• 30-day return policy</p>
        <p>• Authentic guarantee</p>
        <p>• Secure checkout</p>
      </div>
    </div>
  );
}
