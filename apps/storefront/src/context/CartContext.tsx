"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Cart, CartItem, Product } from "@shalkaar/shared-types";

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  // TODO: Initialize cart from localStorage or API
  useEffect(() => {
    const initializeCart = async () => {
      // TODO: Fetch cart from API or localStorage
    };
    initializeCart();
  }, []);

  const addToCart = async (product: Product, quantity: number) => {
    // TODO: Add item to cart via API
  };

  const removeFromCart = async (itemId: string) => {
    // TODO: Remove item from cart via API
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    // TODO: Update item quantity via API
  };

  const clearCart = async () => {
    // TODO: Clear cart via API
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
