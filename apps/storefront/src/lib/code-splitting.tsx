import dynamic from 'next/dynamic';
import React, { ComponentType } from 'react';

interface DynamicLoadOptions {
  ssr?: boolean;
  loading?: React.ComponentType;
}

/**
 * Create a dynamically imported component with optional loading state
 */
export function createDynamicComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: DynamicLoadOptions
) {
  return dynamic(importFn, {
    ssr: options?.ssr ?? true,
    loading: options?.loading || (() => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />),
  } as any);
}

/**
 * Lazy load components that aren't critical for initial page load
 */
export const LazyImageGallery = dynamic(
  () => import('../components/ImageGallery'),
  {
    ssr: true,
    loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />,
  }
) as any;

export const LazyReviews = dynamic(
  () => import('../components/Reviews'),
  {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />,
  }
) as any;

export const LazySearchAndFilter = dynamic(
  () => import('../components/SearchAndFilter'),
  {
    ssr: false,
    loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />,
  }
) as any;

export const LazyWishlistButton = dynamic(
  () => import('../components/WishlistButton'),
  {
    ssr: false,
    loading: () => <div className="w-10 h-10 bg-gray-200 animate-pulse rounded" />,
  }
) as any;

/**
 * Prefetch a dynamic component for faster subsequent loads
 */
export function prefetchComponent(componentPath: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = componentPath;
    link.as = 'script';
    document.head.appendChild(link);
  }
}

/**
 * Code splitting strategy for route-based chunks
 */
export const CodeSplitChunks = {
  // These are placeholder imports for documentation purposes
  // Actual pages are loaded through Next.js routing
} as any;

/**
 * Intersection Observer-based lazy loading for sections
 */
export function useLazyLoad(ref: React.RefObject<HTMLElement>, callback: () => void) {
  React.useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, callback]);
}

/**
 * Resource hints for critical resources
 */
export function addResourceHints() {
  if (typeof document !== 'undefined') {
    // Preload critical fonts
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);

    // Preload API endpoints
    const apiHint = document.createElement('link');
    apiHint.rel = 'dns-prefetch';
    apiHint.href = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    document.head.appendChild(apiHint);
  }
}

/**
 * Bundle size analyzer helper
 */
export function reportBundleMetrics() {
  if (typeof window !== 'undefined' && 'navigation' in window.performance) {
    const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domInteractive: perfData.domInteractive,
      domContentLoaded: perfData.domContentLoadedEventEnd,
      loadComplete: perfData.loadEventEnd,
      resourceCount: window.performance.getEntriesByType('resource').length,
      totalResourceSize: window.performance
        .getEntriesByType('resource')
        .reduce((sum: number, entry: PerformanceEntry) => {
          if ('transferSize' in entry) {
            return sum + ((entry as any).transferSize || 0);
          }
          return sum;
        }, 0),
    };
  }
  return null;
}
