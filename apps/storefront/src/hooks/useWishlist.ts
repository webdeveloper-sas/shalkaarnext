import { useState, useCallback } from "react";

interface UseWishlistOptions {
  onAdd?: (_id: string) => void;
  onRemove?: (_id: string) => void;
}

export function useWishlist(options?: UseWishlistOptions) {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const addToWishlist = useCallback(
    async (productId: string) => {
      setIsLoading(true);
      try {
        // TODO: Call API to add to wishlist
        setWishlistIds((prev) => new Set([...prev, productId]));
        options?.onAdd?.(productId);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      setIsLoading(true);
      try {
        // TODO: Call API to remove from wishlist
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        options?.onRemove?.(productId);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  return {
    wishlistIds,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    isLoading,
  };
}
