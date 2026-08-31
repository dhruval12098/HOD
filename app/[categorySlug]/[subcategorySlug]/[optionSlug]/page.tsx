import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryCollectionPage, { generateCatalogMetadata } from '../../page'
import { resolveCatalogTaxonomy } from '@/lib/catalog-taxonomy'

export const dynamic = 'force-dynamic'

type RouteProps = {
  params: Promise<{ categorySlug: string; subcategorySlug: string; optionSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(props: RouteProps): Promise<Metadata> {
  const route = await resolveCatalogTaxonomy(await props.params)
  if (!route?.option) return { title: 'Collection' }
  return generateCatalogMetadata(route, await props.searchParams)
}

export default async function OptionCollectionPage(props: RouteProps) {
  const route = await resolveCatalogTaxonomy(await props.params)
  if (!route?.option) notFound()

  return CategoryCollectionPage({
    params: Promise.resolve({ categorySlug: route.category.slug }),
    searchParams: props.searchParams,
    taxonomy: route,
  })
}
