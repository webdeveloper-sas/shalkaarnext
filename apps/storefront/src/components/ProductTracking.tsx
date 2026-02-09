'use client';

import { useEffect } from 'react';
import { trackViewItem, useAnalytics } from '@/lib/analytics';

interface ProductTrackingProps {
  product: {
    id: string;
    name: string;
    price: number;
    category?: string;
  };
  children?: React.ReactNode;
}

/**
 * Client-side component for product page analytics tracking
 * Wrapped around product detail content
 */
export default function ProductTracking({ product, children }: ProductTrackingProps) {
  // Track page view
  useAnalytics('ProductDetail', {
    product_id: product.id,
    product_name: product.name,
    product_price: product.price,
    product_category: product.category,
  });

  // Track product view
  useEffect(() => {
    trackViewItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      currency: 'USD',
    });
  }, [product.id, product.name, product.price, product.category]);

  return <>{children}</>;
}
