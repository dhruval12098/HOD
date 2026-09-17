import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'
import { buildOptionPath, buildSubcategoryPath } from '@/lib/catalog-paths'
import type { ResolvedCatalogTaxonomy } from '@/lib/catalog-taxonomy'

const filterQueryKeys = ['subcategory', 'option', 'shape', 'style', 'metal', 'certificate', 'sort', 'page'] as const

export function hasCatalogFilterQuery(params: Record<string, string | string[] | undefined>) {
  return filterQueryKeys.some((key) => typeof params[key] === 'string' && Boolean(params[key]))
}

export async function generateCatalogMetadata(
  taxonomy: ResolvedCatalogTaxonomy,
  query: Record<string, string | string[] | undefined>
): Promise<Metadata> {
  const path = taxonomy.option
    ? buildOptionPath(taxonomy.category, taxonomy.subcategory, taxonomy.option)
    : buildSubcategoryPath(taxonomy.category, taxonomy.subcategory)
  const title = taxonomy.option?.name ?? taxonomy.subcategory.name
  const metadata = createPageMetadata({
    title: `${title} | ${taxonomy.category.name}`,
    description: `Browse ${title} in ${taxonomy.category.name}.`,
    path,
  })

  return hasCatalogFilterQuery(query)
    ? { ...metadata, robots: { index: false, follow: true } }
    : metadata
}