"use client";

import { useState } from "react";

interface ProductImageGalleryProps {
  productName: string;
  images?: string[];
}

export default function ProductImageGallery({
  productName,
  images = [],
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Use placeholder images for now
  const displayImages =
    images.length > 0
      ? images
      : [
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect fill='%23c4b5fd' width='500' height='500'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%235b21b6' text-anchor='middle' dy='.3em'%3EProduct Image%3C/text%3E%3C/svg%3E",
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect fill='%23ddd6fe' width='500' height='500'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%235b21b6' text-anchor='middle' dy='.3em'%3EAlternate View%3C/text%3E%3C/svg%3E",
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect fill='%23f3e8ff' width='500' height='500'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%235b21b6' text-anchor='middle' dy='.3em'%3EDetail View%3C/text%3E%3C/svg%3E",
        ];

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg overflow-hidden mb-4">
        <img
          src={displayImages[selectedImage]}
          alt={`${productName} - Image ${selectedImage + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {displayImages.map((image, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                selectedImage === idx
                  ? "ring-2 ring-purple-600"
                  : "ring-1 ring-gray-300 hover:ring-purple-400"
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={image}
                alt={`${productName} - Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
