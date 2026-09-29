import type { MetadataRoute } from 'next'
import { getPublishedBlogPosts } from '@/lib/blog'
import { getPublishedEducationPosts } from '@/lib/education'
import { getStorefrontProductDiscoveryRows } from '@/lib/catalog-products'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { getCanonicalUrl } from '@/lib/site-url'
import { buildCategoryPath, buildOptionPath, buildSubcategoryPath } from '@/lib/catalog-paths'
import { isPublicCatalogTaxonomy } from '@/lib/catalog-publication'

export const dynamic = 'force-dynamic'

const staticRoutes = [
  '/',
  '/shop',
  '/collection',
  '/bespoke',
  '/about',
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

  const [products, categoriesResult, subcategoriesResult, optionsResult, blogPosts, educationPosts] = await Promise.all([
    getStorefrontProductDiscoveryRows(),
    supabase
      .from('catalog_categories')
      .select('*')
      .eq('status', 'active'),
    supabase
      .from('catalog_subcategories')
      .select('*')
      .eq('status', 'active'),
    supabase
      .from('catalog_options')
      .select('*')
      .eq('status', 'active'),
    getPublishedBlogPosts(),
    getPublishedEducationPosts(),
  ])

  const categories = categoriesResult.data ?? []
  const subcategories = subcategoriesResult.data ?? []
  const options = optionsResult.data ?? []

  const staticEntries = staticRoutes.map((route) => ({
    url: getCanonicalUrl(route).toString(),
  }))

  const categoryEntries = categories
    .filter(isPublicCatalogTaxonomy)
    .filter((category) => category.slug && category.slug !== 'hiphop')
    .filter((category) => !staticRoutes.includes(buildCategoryPath(category)))
    .map((category) => ({
      url: getCanonicalUrl(buildCategoryPath(category)).toString(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))

  const subcategoryEntries = subcategories
    .filter(isPublicCatalogTaxonomy)
    .filter((subcategory) => subcategory.slug)
    .flatMap((subcategory) => {
      const category = categories.find((entry) => entry.id === subcategory.category_id)
      if (!category) return []
      return [{
        url: getCanonicalUrl(buildSubcategoryPath(category, subcategory)).toString(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }]
    })

  const optionEntries = options
    .filter(isPublicCatalogTaxonomy)
    .filter((option) => option.slug)
    .flatMap((option) => {
      const subcategory = subcategories.find((entry) => entry.id === option.subcategory_id)
      if (!subcategory) return []
      const category = categories.find((entry) => entry.id === subcategory.category_id)
      if (!category) return []
      return [{
        url: getCanonicalUrl(buildOptionPath(category, subcategory, option)).toString(),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }]
    })

  const productEntries = products
    .filter((product) => product.slug)
    .map((product) => ({
      url: getCanonicalUrl(`/shop/${product.slug}`).toString(),
      lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
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

  return [
    ...staticEntries,
    ...categoryEntries,
    ...subcategoryEntries,
    ...optionEntries,
    ...productEntries,
    ...blogEntries,
    ...educationEntries,
  ]
}
