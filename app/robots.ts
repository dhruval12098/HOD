import type { MetadataRoute } from 'next'
import { getCanonicalUrl, getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const privatePaths = [
    '/api/',
    '/cart',
    '/checkout',
    '/login',
    '/signup',
    '/profile',
    '/wishlist',
    '/maintenance',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: privatePaths,
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'CCBot',
          'ClaudeBot',
          'Google-Extended',
          'PerplexityBot',
          'Applebot-Extended',
        ],
        disallow: '/',
      },
    ],
    sitemap: getCanonicalUrl('/sitemap.xml').toString(),
    host: getSiteUrl(),
  }
}
