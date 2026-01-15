// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/auth/callback',
          '/test-simple',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/callback',
        ],
        crawlDelay: 0.5, // Slower crawl for better indexing
      },
      // Additional bots
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Slurp',
        allow: '/',
        disallow: ['/api/', '/admin/'],
        crawlDelay: 1,
      },
    ],
    sitemap: [
      'https://nimart.ng/sitemap.xml',
      'https://nimart.ng/nimart-sitemap.xml', // Additional sitemap
    ],
    // Additional directives
    host: 'https://nimart.ng',
  }
}