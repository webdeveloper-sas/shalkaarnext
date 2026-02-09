"use client";

import { useState } from "react";
import type { LocalCartItem } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";

interface CartItemProps {
  item: LocalCartItem;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
    setIsUpdating(true);
    try {
      await updateQuantity(item.productId, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await removeFromCart(item.productId);
    } finally {
      setIsUpdating(false);
    }
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className="flex gap-4 py-6 border-b border-gray-200">
      {/* Product Thumbnail */}
      <div className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
        <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
        <p className="text-gray-600 text-sm mt-1">₹{item.price.toLocaleString()}</p>

        {/* Quantity Selector */}
        <div className="mt-4 flex items-center gap-3">
          <label htmlFor={`qty-${item.id}`} className="text-sm text-gray-600">
            Qty:
          </label>
          <input
            id={`qty-${item.id}`}
            type="number"
            min="1"
            max="999"
            value={item.quantity}
            onChange={handleQuantityChange}
            disabled={isUpdating}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-center disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Quantity for ${item.name}`}
          />
        </div>
      </div>

      {/* Item Total and Remove */}
      <div className="flex flex-col items-end gap-4">
        <div className="text-right">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-lg font-bold text-gray-900">
            ₹{itemTotal.toLocaleString()}
          </p>
        </div>

        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={`Remove ${item.name} from cart`}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
