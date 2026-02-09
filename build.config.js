/**
 * Build Optimization Configuration
 * Used by build scripts to optimize for production
 */

module.exports = {
  // Next.js Frontend Build Settings
  nextjs: {
    // Production build output
    output: 'standalone',
    
    // Enable SWR (Stale While Revalidate)
    swrDuration: 60, // seconds
    
    // Image optimization
    images: {
      unoptimized: false,
      formats: ['image/avif', 'image/webp'],
    },
    
    // Compression
    compress: true,
    
    // Production source maps (disabled for size)
    productionBrowserSourceMaps: false,
    
    // PoweredBy header
    poweredByHeader: false,
  },

  // NestJS Backend Build Settings
  nestjs: {
    // Minification
    minify: true,
    
    // Source maps for production debugging
    sourceMap: true,
    
    // Remove console logs in production
    removeConsole: true,
    
    // Optimize decorators
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
  },

  // Bundle Analysis
  bundleAnalysis: {
    // Enable webpack bundle analyzer
    enabled: process.env.ANALYZE === 'true',
    
    // Output directory
    outputDir: '.bundle-analysis',
  },

  // Build Optimization
  optimization: {
    // CSS minification
    minifyCss: true,
    
    // JavaScript minification
    minifyJs: true,
    
    // Image optimization
    optimizeImages: true,
    
    // Remove unused CSS
    purgeCss: true,
    
    // Tree shaking (enabled by default in production)
    treeShake: true,
  },

  // Caching Strategy
  caching: {
    // Browser cache duration (seconds)
    maxAge: 31536000, // 1 year
    
    // Static assets cache
    staticMaxAge: 31536000,
    
    // HTML cache
    htmlMaxAge: 3600, // 1 hour
    
    // API response cache
    apiMaxAge: 300, // 5 minutes
  },

  // Output Settings
  output: {
    // Gzip compression
    gzip: true,
    
    // Brotli compression
    brotli: true,
    
    // Generate report
    report: false,
  },

  // Environment-specific settings
  environments: {
    development: {
      sourceMap: true,
      minify: false,
      removeConsole: false,
      productionBrowserSourceMaps: true,
    },
    staging: {
      sourceMap: true,
      minify: true,
      removeConsole: false,
      productionBrowserSourceMaps: true,
    },
    production: {
      sourceMap: false,
      minify: true,
      removeConsole: true,
      productionBrowserSourceMaps: false,
    },
  },
};
