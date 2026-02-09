import { useEffect, useRef } from 'react';

/**
 * Accessibility utilities for keyboard navigation, ARIA, and screen reader support
 */

/**
 * Keyboard event handler hook
 */
export function useKeyboardNavigation(
  handlers: Record<string, () => void>,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeydown = (e: KeyboardEvent) => {
      const handler = handlers[e.key] || handlers[e.code];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [handlers, enabled]);
}

/**
 * Focus management hook
 */
export function useFocusManagement(ref: React.RefObject<HTMLElement>) {
  return {
    setFocus: () => ref.current?.focus(),
    focusFirst: () => (ref.current?.querySelector('button, a, input') as HTMLElement)?.focus(),
    focusLast: () => {
      const focusable = ref.current?.querySelectorAll('button, a, input, select, textarea');
      if (focusable && focusable.length > 0) {
        (focusable[focusable.length - 1] as HTMLElement).focus();
      }
    },
  };
}

/**
 * Announce changes to screen readers
 */
export function useAriaLive(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      const div = document.createElement('div');
      div.setAttribute('aria-live', priority);
      div.setAttribute('aria-atomic', 'true');
      div.className = 'sr-only';
      document.body.appendChild(div);
      return;
    }

    ref.current.textContent = message;
  }, [message, priority]);

  return ref;
}

/**
 * Skip links component for keyboard navigation
 */
export function createSkipLinksHTML(): string {
  return `
    <nav class="skip-links" aria-label="Skip links">
      <a href="#main" class="skip-link">Skip to main content</a>
      <a href="#nav" class="skip-link">Skip to navigation</a>
      <a href="#footer" class="skip-link">Skip to footer</a>
    </nav>
    <style>
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: #000;
        color: white;
        padding: 8px;
        z-index: 100;
      }
      .skip-link:focus {
        top: 0;
      }
    </style>
  `;
}

/**
 * Generate accessible heading structure
 */
export function generateHeadingStructure(text: string, level: 1 | 2 | 3 | 4 | 5 | 6): string {
  const HeadingTag = `h${level}`;
  return `<${HeadingTag}>${text}</${HeadingTag}>`;
}

/**
 * Color contrast checker (WCAG AA standard)
 */
export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} {
  const getRGB = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
  };

  const getLuminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map((val) => {
      const v = val / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const fgRGB = getRGB(foreground);
  const bgRGB = getRGB(background);

  const fgLum = getLuminance(fgRGB);
  const bgLum = getLuminance(bgRGB);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  };
}

/**
 * ARIA attribute builder
 */
export const AriaLabels = {
  button: (label: string) => ({ 'aria-label': label }),
  link: (label: string) => ({ 'aria-label': label }),
  heading: (level: number) => ({ role: 'heading', 'aria-level': level }),
  region: (name: string) => ({ role: 'region', 'aria-label': name }),
  navigation: (name?: string) => ({ role: 'navigation', 'aria-label': name || 'Main navigation' }),
  contentinfo: () => ({ role: 'contentinfo' }),
  banner: () => ({ role: 'banner' }),
  main: () => ({ role: 'main', id: 'main' }),
  live: (priority: 'polite' | 'assertive' = 'polite') => ({
    'aria-live': priority,
    'aria-atomic': 'true',
  }),
  button_expanded: (expanded: boolean) => ({
    'aria-expanded': expanded,
    'aria-controls': 'expanded-content',
  }),
  loading: () => ({
    'aria-busy': 'true',
    'aria-label': 'Loading...',
  }),
  alert: (message: string) => ({
    role: 'alert',
    'aria-live': 'assertive',
    'aria-label': message,
  }),
};

/**
 * Test for keyboard accessibility
 */
export function testKeyboardAccessibility(): {
  tabbableElements: number;
  focusableWithoutTab: number;
  skipLinks: number;
  ariaLabels: number;
} {
  const tabbable = document.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ).length;

  const focusable = document.querySelectorAll('div[role="button"], div[role="link"]').length;

  const skipLinks = document.querySelectorAll('[href*="#"]').length;

  const ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]').length;

  return {
    tabbableElements: tabbable,
    focusableWithoutTab: focusable,
    skipLinks,
    ariaLabels,
  };
}

/**
 * Accessibility report generator
 */
export function generateAccessibilityReport() {
  return {
    keyboardTesting: testKeyboardAccessibility(),
    headingStructure: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
    images: {
      total: document.querySelectorAll('img').length,
      withAlt: document.querySelectorAll('img[alt]').length,
      withoutAlt: document.querySelectorAll('img:not([alt])').length,
    },
    forms: {
      total: document.querySelectorAll('form').length,
      withLabels: document.querySelectorAll('label').length,
      inputs: document.querySelectorAll('input, select, textarea').length,
    },
    ariaCompliance: {
      total: document.querySelectorAll('[role], [aria-*]').length,
      landmarkRegions: document.querySelectorAll('[role="banner"], [role="main"], [role="contentinfo"]')
        .length,
    },
    colorContrast: 'Manual testing required using checkColorContrast()',
  };
}

/**
 * Semantic HTML helpers
 */
export const SemanticHTML = {
  article: (content: string, title?: string) =>
    `<article><h2>${title || ''}</h2>${content}</article>`,
  section: (content: string, label: string) =>
    `<section aria-label="${label}">${content}</section>`,
  aside: (content: string, label?: string) =>
    `<aside aria-label="${label || 'Additional information'}">${content}</aside>`,
  nav: (content: string, label?: string) =>
    `<nav aria-label="${label || 'Navigation'}">${content}</nav>`,
  main: (content: string) => `<main>${content}</main>`,
  footer: (content: string) => `<footer>${content}</footer>`,
};

/**
 * Focus visible polyfill for better keyboard navigation styling
 */
export function enableFocusVisible() {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', () => {
      document.documentElement.classList.add('keyboard-nav');
    });

    document.addEventListener('mousedown', () => {
      document.documentElement.classList.remove('keyboard-nav');
    });
  }
}

/**
 * Reduced motion preferences
 */
export function respectReducedMotion() {
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return prefersReducedMotion;
  }
  return false;
}

/**
 * Dark mode preference detection
 */
export function respectDarkModePreference() {
  if (typeof window !== 'undefined') {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDarkMode;
  }
  return false;
}
