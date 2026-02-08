export * from './enums';
export * from './types';
export * from './dtos';

// Color constants for design system
export const BRAND_COLORS = {
  deepIndigo: '#1a2847',
  burntSienna: '#8b4513',
  offWhite: '#f5f1ed',
  charcoal: '#2a2a2a',
  deepRed: '#8b1a1a',
  warmSand: '#d4b9a0',
  deepTeal: '#2d5a5a',
  mediumGray: '#b0a8a0',
  lightGray: '#e8e4df',
  softGold: '#d4af37',
};

// Typography constants
export const TYPOGRAPHY = {
  h1: { size: '48-56px', lineHeight: 1.3, weight: 400 },
  h2: { size: '36-40px', lineHeight: 1.3, weight: 400 },
  h3: { size: '24-28px', lineHeight: 1.4, weight: 600 },
  h4: { size: '18-20px', lineHeight: 1.4, weight: 500 },
  body: { size: '16px', lineHeight: 1.6, weight: 400 },
  caption: { size: '13-14px', lineHeight: 1.5, weight: 400 },
  fontFamily: {
    primary: '"Segoe UI", system-ui, sans-serif',
    secondary: '"Georgia", serif',
  },
};

// Spacing constants
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '40px',
  xxl: '80px',
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
  TIMEOUT: 10000,
  RETRIES: 3,
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
};
