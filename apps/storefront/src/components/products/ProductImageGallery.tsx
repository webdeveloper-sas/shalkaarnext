"use client";

import ImageGallery from "@/components/ImageGallery";

interface ProductImageGalleryProps {
  productName: string;
  images?: string[];
}

export default function ProductImageGallery({
  productName,
  images = [],
}: ProductImageGalleryProps) {
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
      <ImageGallery
        images={displayImages}
        alt={productName}
        productName={productName}
      />
    </div>
  );
}
