import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  pageName: string;
  pageLoadTime: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
  resourceCount?: number;
  resourceSize?: number;
  timestamp: string;
}

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  entries?: PerformanceEntry[];
}

/**
 * Collect Core Web Vitals
 */
export function captureWebVitals(callback: (metric: WebVitalMetric) => void) {
  // Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];

        callback({
          name: 'LCP',
          value: lastEntry.startTime,
          rating: lastEntry.startTime < 2500 ? 'good' : 'poor',
          entries: entries as PerformanceEntry[],
        });
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if ('hadRecentInput' in entry && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;

            callback({
              name: 'CLS',
              value: clsValue,
              rating: clsValue < 0.1 ? 'good' : 'poor',
            });
          }
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0];

        if ('processingDuration' in firstInput) {
          callback({
            name: 'FID',
            value: (firstInput as any).processingDuration,
            rating: (firstInput as any).processingDuration < 100 ? 'good' : 'poor',
          });
        }
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('Web Vitals monitoring not available:', e);
    }
  }
}

/**
 * Measure page load and interaction metrics
 */
export function usePerformanceMonitoring(pageName: string) {
  useEffect(() => {
    const measurePagePerformance = () => {
      if (typeof window === 'undefined') return;

      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = window.performance.getEntriesByType('paint');

      const fcp = paint.find((entry) => entry.name === 'first-contentful-paint')?.startTime;
      const metrics: PerformanceMetrics = {
        pageName,
        pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        firstContentfulPaint: fcp,
        resourceCount: window.performance.getEntriesByType('resource').length,
        resourceSize: window.performance
          .getEntriesByType('resource')
          .reduce((sum, entry) => sum + ((entry as PerformanceResourceTiming).transferSize || 0), 0),
        timestamp: new Date().toISOString(),
      };

      // Send metrics to analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'page_view', {
          page_title: pageName,
          page_load_time: metrics.pageLoadTime,
          fcp: metrics.firstContentfulPaint,
        });
      }

      console.info(`[Performance] ${pageName}:`, metrics);
    };

    if (document.readyState === 'complete') {
      measurePagePerformance();
      return () => {};
    } else {
      window.addEventListener('load', measurePagePerformance);
      return () => window.removeEventListener('load', measurePagePerformance);
    }
  }, [pageName]);
}

/**
 * Monitor user interactions and time-to-interactive
 */
export function useInteractionTracking() {
  const interactionRef = useRef<{ [key: string]: number }>({});

  const trackInteraction = (eventName: string, metadata?: Record<string, any>) => {
    const timestamp = performance.now();
    interactionRef.current[eventName] = timestamp;

    // Track with analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', eventName, {
        timestamp,
        ...metadata,
      });
    }
  };

  useEffect(() => {
    const trackClicks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        trackInteraction('click', {
          element: target.textContent?.substring(0, 50) || 'unknown',
        });
      }
    };

    document.addEventListener('click', trackClicks);
    return () => document.removeEventListener('click', trackClicks);
  }, []);

  return { trackInteraction, getInteractions: () => interactionRef.current };
}

/**
 * Measure and report network performance
 */
export function analyzeNetworkPerformance() {
  if (typeof window === 'undefined') return null;

  const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  return {
    apiRequests: resources
      .filter((r) => r.name.includes('/api/'))
      .map((r) => ({
        url: r.name,
        duration: r.duration,
        size: r.transferSize || 0,
        cached: r.transferSize === 0,
      })),
    slowestResources: resources
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map((r) => ({
        name: r.name.split('/').pop() || 'unknown',
        duration: r.duration,
        size: r.transferSize || 0,
      })),
    totalRequests: resources.length,
    totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
    avgResponseTime: resources.length > 0 ? resources.reduce((sum, r) => sum + r.duration, 0) / resources.length : 0,
  };
}

/**
 * Setup performance observer for long tasks
 */
export function observeLongTasks(threshold: number = 50) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if ('duration' in entry && entry.duration > threshold) {
          console.warn('[Long Task Detected]', {
            name: entry.name,
            duration: (entry as any).duration,
            startTime: entry.startTime,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (e) {
    // Long Task API not available in some browsers
  }
}

/**
 * Memory usage monitoring (if available)
 */
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return null;

  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    utilizationPercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
}

/**
 * Export performance report
 */
export function generatePerformanceReport() {
  return {
    webVitals: 'Use captureWebVitals() to collect',
    networkAnalysis: analyzeNetworkPerformance(),
    memoryUsage: monitorMemoryUsage(),
    timestamp: new Date().toISOString(),
  };
}
