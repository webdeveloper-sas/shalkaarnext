"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

export interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = "shalkaar_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        setItems(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error("Failed to restore wishlist:", error);
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoading]);

  const addToWishlist = useCallback((item: WishlistItem) => {
    setItems((prevItems) => {
      // Check if item already exists
      if (prevItems.some((i) => i.id === item.id)) {
        return prevItems;
      }
      return [...prevItems, { ...item, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((i) => i.id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.id === productId),
    [items]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const getWishlistCount = useCallback(() => items.length, [items]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
