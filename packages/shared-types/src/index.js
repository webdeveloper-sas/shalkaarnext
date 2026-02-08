"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGINATION = exports.API_CONFIG = exports.SPACING = exports.TYPOGRAPHY = exports.BRAND_COLORS = void 0;
__exportStar(require("./enums"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./dtos"), exports);
exports.BRAND_COLORS = {
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
exports.TYPOGRAPHY = {
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
exports.SPACING = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '40px',
    xxl: '80px',
};
exports.API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333',
    TIMEOUT: 10000,
    RETRIES: 3,
};
exports.PAGINATION = {
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100,
    DEFAULT_OFFSET: 0,
};
//# sourceMappingURL=index.js.map