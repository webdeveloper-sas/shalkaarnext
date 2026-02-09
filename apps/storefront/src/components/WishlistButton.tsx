"use client";

import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";

interface WishlistButtonProps {
  productId: string;
  productName: string;
  price: number;
  image?: string;
  variant?: "icon" | "button";
}

export default function WishlistButton({
  productId,
  productName,
  price,
  image = "",
  variant = "icon",
}: WishlistButtonProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [notification, setNotification] = useState<string | null>(null);
  const inWishlist = isInWishlist(productId);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(productId);
      setNotification("Removed from wishlist");
    } else {
      addToWishlist({
        id: productId,
        name: productName,
        price,
        image,
        addedAt: new Date().toISOString(),
      });
      setNotification("Added to wishlist!");
    }

    // Clear notification after 2 seconds
    setTimeout(() => setNotification(null), 2000);
  };

  if (variant === "button") {
    return (
      <div className="relative">
        <button
          onClick={handleWishlistClick}
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            inWishlist
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <span>{inWishlist ? "♥" : "♡"}</span>
          {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </button>
        {notification && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
            {notification}
          </div>
        )}
      </div>
    );
  }

  // Icon variant
  return (
    <div className="relative">
      <button
        onClick={handleWishlistClick}
        className={`p-2 rounded-full transition-all ${
          inWishlist
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
        title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg
          className="w-5 h-5"
          fill={inWishlist ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>
      {notification && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
          {notification}
        </div>
      )}
    </div>
  );
}
