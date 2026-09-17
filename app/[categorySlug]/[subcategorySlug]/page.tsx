import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryCollectionPageContent } from '../CategoryCollectionPageContent'
import { generateCatalogMetadata } from '@/lib/catalog-metadata'
import { resolveCatalogTaxonomy } from '@/lib/catalog-taxonomy'

export const dynamic = 'force-dynamic'

type RouteProps = {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(props: RouteProps): Promise<Metadata> {
  const route = await resolveCatalogTaxonomy(await props.params)
  if (!route) return { title: 'Collection' }
  return generateCatalogMetadata(route, await props.searchParams)
}

export default async function SubcategoryCollectionPage(props: RouteProps) {
  const route = await resolveCatalogTaxonomy(await props.params)
  if (!route) notFound()

  return CategoryCollectionPageContent({
    params: Promise.resolve({ categorySlug: route.category.slug }),
    searchParams: props.searchParams,
    taxonomy: route,
  })
}
