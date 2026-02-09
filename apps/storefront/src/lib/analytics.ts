import { useEffect } from 'react';

/**
 * Analytics and tracking utilities for conversion tracking and event analytics
 */

interface AnalyticsEvent {
  eventName: string;
  category: string;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
}

interface ConversionEvent {
  conversionType: 'view' | 'add_to_cart' | 'purchase' | 'wishlist' | 'review';
  productId: string;
  productName: string;
  value?: number;
  currency?: string;
}

/**
 * Initialize analytics tracking
 */
export function initializeAnalytics(trackingId: string) {
  if (typeof window === 'undefined') return;

  // Load Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function gtag(..._args: any[]) {
    (window as any).dataLayer.push(arguments);
  }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', trackingId);
}

/**
 * Track custom events
 */
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined' || !('gtag' in window)) {
    console.debug('Analytics not initialized, event not tracked:', event);
    return;
  }

  const eventData = {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    ...event.customData,
  };

  (window as any).gtag('event', event.eventName, eventData);

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.info('[Analytics Event]', event.eventName, eventData);
  }
}

/**
 * Track conversion events
 */
export function trackConversion(event: ConversionEvent) {
  trackEvent({
    eventName: `conversion_${event.conversionType}`,
    category: 'conversion',
    label: event.productName,
    value: event.value,
    customData: {
      product_id: event.productId,
      product_name: event.productName,
      currency: event.currency || 'USD',
      type: event.conversionType,
    },
  });

  // Fire pixel for each conversion type
  fireConversionPixel(event.conversionType, event.productId);
}

/**
 * Track page views
 */
export function trackPageView(pageName: string, pageProperties?: Record<string, any>) {
  if (typeof window === 'undefined' || !('gtag' in window)) return;

  (window as any).gtag('event', 'page_view', {
    page_title: pageName,
    page_path: window.location.pathname,
    ...pageProperties,
  });
}

/**
 * Track user properties
 */
export function setUserProperties(userId: string, properties: Record<string, any>) {
  if (typeof window === 'undefined' || !('gtag' in window)) return;

  (window as any).gtag('set', {
    user_id: userId,
    ...properties,
  });
}

/**
 * Track e-commerce view item
 */
export function trackViewItem(product: {
  id: string;
  name: string;
  category?: string;
  price?: number;
  currency?: string;
}) {
  trackConversion({
    conversionType: 'view',
    productId: product.id,
    productName: product.name,
    value: product.price,
    currency: product.currency,
  });

  if (typeof window === 'undefined' || !('gtag' in window)) return;

  (window as any).gtag('event', 'view_item', {
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        currency: product.currency || 'USD',
      },
    ],
  });
}

/**
 * Track add to cart
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  currency?: string;
}) {
  trackConversion({
    conversionType: 'add_to_cart',
    productId: product.id,
    productName: product.name,
    value: product.price,
    currency: product.currency,
  });

  if (typeof window === 'undefined' || !('gtag' in window)) return;

  (window as any).gtag('event', 'add_to_cart', {
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity || 1,
        currency: product.currency || 'USD',
      },
    ],
  });
}

/**
 * Track purchase
 */
export function trackPurchase(order: {
  orderId: string;
  revenue: number;
  currency?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  tax?: number;
  shipping?: number;
}) {
  if (typeof window === 'undefined' || !('gtag' in window)) return;

  (window as any).gtag('event', 'purchase', {
    transaction_id: order.orderId,
    value: order.revenue,
    currency: order.currency || 'USD',
    tax: order.tax,
    shipping: order.shipping,
    items: order.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });

  // Track conversion separately
  trackConversion({
    conversionType: 'purchase',
    productId: order.orderId,
    productName: 'Order',
    value: order.revenue,
    currency: order.currency,
  });
}

/**
 * Track wishlist addition
 */
export function trackWishlistAdd(product: { id: string; name: string; price?: number }) {
  trackConversion({
    conversionType: 'wishlist',
    productId: product.id,
    productName: product.name,
    value: product.price,
  });
}

/**
 * Track review submission
 */
export function trackReviewSubmit(product: {
  id: string;
  name: string;
  rating: number;
}) {
  trackConversion({
    conversionType: 'review',
    productId: product.id,
    productName: product.name,
  });
}

/**
 * Fire conversion pixel for third-party tracking
 */
function fireConversionPixel(conversionType: string, productId: string) {
  if (typeof window === 'undefined') return;

  // Facebook Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', conversionType, {
      content_id: productId,
      content_type: 'product',
    });
  }

  // Additional pixel tracking can be added here
}

/**
 * Setup analytics hooks
 */
export function useAnalytics(pageName: string, properties?: Record<string, any>) {
  useEffect(() => {
    trackPageView(pageName, properties);
  }, [pageName, properties]);
}

/**
 * Track interaction (click, form submission, etc.)
 */
export function trackInteraction(action: string, category: string, label?: string) {
  trackEvent({
    eventName: action,
    category,
    label,
  });
}

/**
 * Generate analytics report for a date range
 */
export function generateAnalyticsReport(startDate: Date, endDate: Date) {
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    note: 'Use Google Analytics API or Firebase for detailed reports',
    localStorageMetrics: {
      pageViews: localStorage.getItem('analytics_pageviews') || '0',
      conversions: localStorage.getItem('analytics_conversions') || '0',
    },
  };
}

/**
 * A/B Testing framework
 */
export class ABTest {
  private testId: string;
  private variants: string[];
  private userVariant: string | null;

  constructor(testId: string, variants: string[]) {
    this.testId = testId;
    this.variants = variants;
    this.userVariant = this.getUserVariant();
  }

  private getUserVariant(): string | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(`ab_test_${this.testId}`);
    if (stored) return stored;

    // Assign random variant
    const variant = this.variants[Math.floor(Math.random() * this.variants.length)];
    localStorage.setItem(`ab_test_${this.testId}`, variant);
    return variant;
  }

  getVariant(): string | null {
    return this.userVariant;
  }

  trackConversion(value?: number) {
    if (!this.userVariant) return;

    trackEvent({
      eventName: `ab_test_conversion`,
      category: 'ab_testing',
      label: `${this.testId}_${this.userVariant}`,
      value,
    });
  }
}

/**
 * Heatmap tracking helper
 */
export function trackClickHeatmap() {
  if (typeof window === 'undefined') return;

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    trackEvent({
      eventName: 'heatmap_click',
      category: 'heatmap',
      customData: {
        element: target.tagName,
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        className: target.className,
      },
    });
  });
}

/**
 * Session recording consent
 */
export function requestSessionRecordingConsent(): boolean {
  if (typeof window === 'undefined') return false;

  return localStorage.getItem('session_recording_consent') === 'true';
}

export function setSessionRecordingConsent(value: boolean) {
  if (typeof window === 'undefined') return;

  localStorage.setItem('session_recording_consent', value.toString());
}
