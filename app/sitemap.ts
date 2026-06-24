import type { MetadataRoute } from 'next'
import { getPublishedBlogPosts } from '@/lib/blog'
import { getStorefrontProducts } from '@/lib/catalog-products'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { getCanonicalUrl } from '@/lib/site-url'

export const revalidate = 3600

const staticRoutes = [
  '/',
  '/shop',
  '/collection',
  '/hiphop',
  '/bespoke',
  '/b2b',
  '/about',
  '/contact',
  '/faq',
  '/shipping',
  '/returns',
  '/blog',
  '/privacy-policy',
  '/terms',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const supabase = createSupabaseServerClient()

  const [products, categoriesResult, blogPosts] = await Promise.all([
    getStorefrontProducts(),
    supabase
      .from('catalog_categories')
      .select('slug, status')
      .eq('status', 'active'),
    getPublishedBlogPosts(),
  ])

  const staticEntries = staticRoutes.map((route) => ({
    url: getCanonicalUrl(route).toString(),
    lastModified: now,
  }))

  const categoryEntries = (categoriesResult.data ?? [])
    .filter((category) => category.slug)
    .map((category) => ({
      url: getCanonicalUrl(`/${category.slug}`).toString(),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

  const productEntries = products
    .filter((product) => product.slug)
    .map((product) => ({
      url: getCanonicalUrl(`/shop/${product.slug}`).toString(),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

  const blogEntries = blogPosts
    .filter((post) => post.slug)
    .map((post) => ({
      url: getCanonicalUrl(`/blog/${post.slug}`).toString(),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [...staticEntries, ...categoryEntries, ...productEntries, ...blogEntries]
}
