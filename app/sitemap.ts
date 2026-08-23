import type { MetadataRoute } from 'next'
import { getPublishedBlogPosts } from '@/lib/blog'
import { getPublishedEducationPosts } from '@/lib/education'
import { getStorefrontProducts } from '@/lib/catalog-products'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { getCanonicalUrl } from '@/lib/site-url'

export const dynamic = 'force-dynamic'

const staticRoutes = [
  '/',
  '/shop',
  '/collection',
  '/hiphop',
  '/bespoke',
  '/about',
  '/contact',
  '/faq',
  '/shipping',
  '/returns',
  '/blog',
  '/education',
  '/privacy-policy',
  '/terms',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseServerClient()

  const [products, categoriesResult, blogPosts, educationPosts] = await Promise.all([
    getStorefrontProducts(),
    supabase
      .from('catalog_categories')
      .select('slug, status')
      .eq('status', 'active'),
    getPublishedBlogPosts(),
    getPublishedEducationPosts(),
  ])

  const staticEntries = staticRoutes.map((route) => ({
    url: getCanonicalUrl(route).toString(),
  }))

  const categoryEntries = (categoriesResult.data ?? [])
    .filter((category) => category.slug)
    .filter((category) => !staticRoutes.includes(`/${category.slug}`))
    .map((category) => ({
      url: getCanonicalUrl(`/${category.slug}`).toString(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

  const productEntries = products
    .filter((product) => product.slug)
    .map((product) => ({
      url: getCanonicalUrl(`/shop/${product.slug}`).toString(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

  const blogEntries = blogPosts
    .filter((post) => post.slug)
    .map((post) => ({
      url: getCanonicalUrl(`/blog/${post.slug}`).toString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  const educationEntries = educationPosts
    .filter((post) => post.slug)
    .filter((post) => post.slug !== 'education-copy')
    .map((post) => ({
      url: getCanonicalUrl(`/education/${post.slug}`).toString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [...staticEntries, ...categoryEntries, ...productEntries, ...blogEntries, ...educationEntries]
}
