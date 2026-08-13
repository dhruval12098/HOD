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
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: privatePaths,
    },
    sitemap: getCanonicalUrl('/sitemap.xml').toString(),
    host: getSiteUrl(),
  }
}
