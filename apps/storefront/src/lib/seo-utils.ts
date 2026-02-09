/**
 * SEO utilities for metadata, structured data, and social sharing
 */

interface MetaTagsConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterHandle?: string;
  locale?: string;
}

interface ProductStructuredData {
  name: string;
  description: string;
  image: string[];
  price: number;
  currency: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  ratingValue?: number;
  reviewCount?: number;
  seller?: string;
}

/**
 * Generate Next.js metadata object for layouts/pages
 */
export function generateMetadata(config: MetaTagsConfig) {
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords?.join(', '),
    openGraph: {
      title: config.title,
      description: config.description,
      url: config.ogUrl,
      image: config.ogImage,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      image: config.ogImage,
      creator: config.twitterHandle,
    },
    canonical: config.canonical,
    viewport: 'width=device-width, initial-scale=1',
  };
}

/**
 * Generate Product JSON-LD structured data
 */
export function generateProductSchema(product: ProductStructuredData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability || 'InStock'}`,
    },
    aggregateRating: product.ratingValue
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.ratingValue,
          reviewCount: product.reviewCount || 0,
        }
      : undefined,
    seller: {
      '@type': 'Organization',
      name: product.seller || 'Shalkaar',
    },
  };
}

/**
 * Generate Breadcrumb JSON-LD structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Organization JSON-LD structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shalkaar',
    url: process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://shalkaar.com',
    logo: `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/logo.png`,
    sameAs: [
      'https://facebook.com/shalkaar',
      'https://instagram.com/shalkaar',
      'https://twitter.com/shalkaar',
    ],
    contact: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@shalkaar.com',
    },
  };
}

/**
 * Generate FAQPage JSON-LD structured data
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Review JSON-LD structured data
 */
export function generateReviewSchema(review: {
  author: string;
  reviewRating: number;
  reviewBody: string;
  datePublished: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.reviewRating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.reviewBody,
    datePublished: review.datePublished,
  };
}

/**
 * Inject JSON-LD script tag
 */
export function createSchemaScriptTag(schema: Record<string, any>) {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/**
 * Generate sitemap entry
 */
export interface SitemapEntry {
  url: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  lastmod?: string;
}

export function generateSitemapXML(entries: SitemapEntry[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://shalkaar.com';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${entries
    .map(
      (entry) => `
  <url>
    <loc>${new URL(entry.url, baseUrl).toString()}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    <changefreq>${entry.changefreq || 'weekly'}</changefreq>
    <priority>${entry.priority || 0.8}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return xml;
}

/**
 * Generate robots.txt
 */
export function generateRobotsTXT(): string {
  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://shalkaar.com';

  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/

Sitemap: ${baseUrl}/sitemap.xml

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /
`;
}

/**
 * Generate Open Graph meta tags
 */
export function generateOpenGraphTags(config: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
}) {
  return {
    'og:title': config.title,
    'og:description': config.description,
    'og:image': config.image,
    'og:url': config.url,
    'og:type': config.type || 'website',
    'og:site_name': 'Shalkaar',
  };
}

/**
 * Generate Twitter Card meta tags
 */
export function generateTwitterCardTags(config: {
  title: string;
  description: string;
  image: string;
  creator?: string;
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
}) {
  return {
    'twitter:card': config.card || 'summary_large_image',
    'twitter:title': config.title,
    'twitter:description': config.description,
    'twitter:image': config.image,
    'twitter:creator': config.creator || '@shalkaar',
  };
}

/**
 * Generate canonical URL
 */
export function getCanonicalURL(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://shalkaar.com';
  return `${baseUrl}${pathname}`.replace(/\/$/, '') || baseUrl;
}

/**
 * SEO-friendly slug generator
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract meta description from content
 */
export function extractMetaDescription(content: string, maxLength: number = 160): string {
  return content
    .replace(/<[^>]*>/g, '')
    .substring(0, maxLength)
    .replace(/\s+$/, '') + (content.length > maxLength ? '...' : '');
}

/**
 * Validate structured data
 */
export function validateStructuredData(schema: Record<string, any>): boolean {
  return (
    schema['@context'] &&
    schema['@type'] &&
    Object.keys(schema).length > 2
  );
}
