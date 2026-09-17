import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

import { createPageMetadata } from '@/lib/seo'
import { buildCategoryPath } from '@/lib/catalog-paths'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { hasCatalogFilterQuery } from '@/lib/catalog-metadata'
import { CategoryCollectionPageContent } from './CategoryCollectionPageContent'

function toPublicUrl(path: string | null | undefined) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return path
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod'
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

async function getCategoryBySlug(slug: string) {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('catalog_categories')
    .select('id, name, slug, banner_desktop_image_path, banner_subtitle')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()

  return data
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const { categorySlug } = await params
  const query = await searchParams
  const category = await getCategoryBySlug(categorySlug)

  if (!category) {
    return {
      title: 'Collection',
      description: 'Browse our collection.',
    }
  }

  const metadata = createPageMetadata({
    title: category.name,
    description: category.banner_subtitle || `Browse ${category.name} from the live catalog.`,
    path: buildCategoryPath(category),
    image: toPublicUrl(category.banner_desktop_image_path),
  })

  if (!hasCatalogFilterQuery(query)) return metadata

  return {
    ...metadata,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function CategoryCollectionPage(props: {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <CategoryCollectionPageContent {...props} />
}