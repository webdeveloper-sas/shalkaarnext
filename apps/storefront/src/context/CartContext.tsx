"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Product } from "@/lib/api";

interface LocalCartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: LocalCartItem[];
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "shalkaar_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load cart from storage:", error);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Failed to save cart to storage:", error);
      }
    }
  }, [items, isHydrated]);

  const addToCart = async (product: Product, quantity: number) => {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    if (!product.stock || product.stock < quantity) {
      throw new Error(
        `Only ${product.stock || 0} item${product.stock !== 1 ? "s" : ""} available`
      );
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > (product.stock || 0)) {
          throw new Error(
            `Cannot exceed available stock of ${product.stock || 0}`
          );
        }
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      const newItem: LocalCartItem = {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.basePrice || 0,
        quantity,
        image: undefined, // Will add real images in Phase 9d
      };

      return [...prevItems, newItem];
    });
  };

  const removeFromCart = async (productId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
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
