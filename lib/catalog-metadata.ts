import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'
import { buildOptionPath, buildSubcategoryPath } from '@/lib/catalog-paths'
import type { ResolvedCatalogTaxonomy } from '@/lib/catalog-taxonomy'

const filterQueryKeys = ['subcategory', 'option', 'shape', 'style', 'metal', 'certificate', 'sort'] as const
export const MAX_CATALOG_PAGE = 100000

export function hasCatalogFilterQuery(params: Record<string, string | string[] | undefined>) {
  return filterQueryKeys.some((key) => typeof params[key] === 'string' && Boolean(params[key]))
}

export function parseCatalogPage(value: string | string[] | undefined) {
  if (value === undefined) return 1
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null

  const page = Number(value)
  return Number.isSafeInteger(page) && page <= MAX_CATALOG_PAGE ? page : null
}

export function getCatalogCanonicalPath(
  path: string,
  query: Record<string, string | string[] | undefined>
) {
  if (hasCatalogFilterQuery(query)) return path

  const page = parseCatalogPage(query.page)
  return page && page > 1 ? `${path}?page=${page}` : path
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
    path: getCatalogCanonicalPath(path, query),
  })

  return hasCatalogFilterQuery(query)
    ? { ...metadata, robots: { index: false, follow: true } }
    : metadata
}
