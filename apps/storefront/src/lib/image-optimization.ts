/**
 * Image Optimization Utilities
 * Handles responsive image sizing, formats, and lazy loading
 */

export interface ImageSize {
  width: number;
  height: number;
}

export interface ResponsiveImage {
  src: string;
  srcSet: string;
  sizes: string;
}

/**
 * Generate responsive image sizes for different breakpoints
 * Mobile: 320px, Tablet: 768px, Desktop: 1024px, Large: 1440px
 */
export const getResponsiveImageSizes = (
  baseUrl: string,
  _filename: string,
  _baseName: string
): ResponsiveImage => {
  const sizes = [
    { width: 320, dpr: '1x' },
    { width: 640, dpr: '2x' },
    { width: 768, dpr: '1x' },
    { width: 1024, dpr: '1x' },
    { width: 1440, dpr: '1x' },
  ];

  const srcSet = sizes
    .map((size) => `${baseUrl}?w=${size.width}&q=75 ${size.width}w`)
    .join(', ');

  return {
    src: `${baseUrl}?w=1024&q=75`,
    srcSet,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  };
};

/**
 * Calculate image dimensions while maintaining aspect ratio
 */
export const calculateImageDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number
): ImageSize => {
  const aspectRatio = originalHeight / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * aspectRatio),
  };
};

/**
 * Generate blur placeholder for image
 */
export const generateBlurHash = (_imageUrl: string): string => {
  // In production, use a library like blurhash or use backend-generated blur data URIs
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3C/svg%3E';
};

/**
 * Check if WebP is supported
 */
export const isWebPSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('webp') === 5;
};

/**
 * Get optimized image URL with transformation parameters
 */
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  const { width, height, quality = 75, format = 'auto' } = options;
  
  const params = new URLSearchParams();
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  params.append('q', quality.toString());
  if (format !== 'auto') params.append('f', format);

  return `${url}?${params.toString()}`;
};

/**
 * Get picture element HTML for responsive images with format fallback
 */
export const getResponsivePictureHTML = (
  imageUrl: string,
  alt: string,
  options: {
    width?: number;
    height?: number;
  } = {}
): string => {
  const webpUrl = `${imageUrl}?f=webp`;
  const jpegUrl = `${imageUrl}?f=jpeg`;
  
  return `
    <picture>
      <source srcSet="${webpUrl}" type="image/webp" />
      <source srcSet="${jpegUrl}" type="image/jpeg" />
      <img src="${jpegUrl}" alt="${alt}" ${options.width ? `width="${options.width}"` : ''} ${options.height ? `height="${options.height}"` : ''} />
    </picture>
  `;
};

/**
 * Lazy load images in viewport
 */
export const observeImagesInViewport = (
  options: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
  }
): void => {
  if (typeof window === 'undefined') return;
  if (!('IntersectionObserver' in window)) return;

  const images = document.querySelectorAll('img[data-lazy-src]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const lazySrc = img.dataset.lazySrc;
        
        if (lazySrc) {
          img.src = lazySrc;
          img.removeAttribute('data-lazy-src');
          observer.unobserve(img);
        }
      }
    });
  }, options);

  images.forEach((img) => observer.observe(img));
};
