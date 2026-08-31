export type CatalogCategoryPathNode = {
  id?: string
  slug: string
}

export type CatalogSubcategoryPathNode = {
  id?: string
  category_id: string
  slug: string
}

export type CatalogOptionPathNode = {
  subcategory_id: string
  slug: string
}

function encodeSlug(slug: string, label: string) {
  const normalized = slug.trim()
  if (!normalized) throw new Error(`${label} slug is required.`)
  if (normalized.includes('/')) throw new Error(`${label} slug must be one path segment.`)
  return encodeURIComponent(normalized)
}

export function buildCategoryPath(category: CatalogCategoryPathNode) {
  return `/${encodeSlug(category.slug, 'Category')}`
}

export function buildSubcategoryPath(
  category: CatalogCategoryPathNode,
  subcategory: CatalogSubcategoryPathNode
) {
  if (!category.id) throw new Error('Category ID is required to validate a subcategory path.')
  if (subcategory.category_id !== category.id) {
    throw new Error('Subcategory does not belong to the supplied category.')
  }
  return `${buildCategoryPath(category)}/${encodeSlug(subcategory.slug, 'Subcategory')}`
}

export function buildOptionPath(
  category: CatalogCategoryPathNode,
  subcategory: CatalogSubcategoryPathNode,
  option: CatalogOptionPathNode
) {
  if (!subcategory.id) throw new Error('Subcategory ID is required to validate an option path.')
  if (option.subcategory_id !== subcategory.id) {
    throw new Error('Option does not belong to the supplied subcategory.')
  }
  return `${buildSubcategoryPath(category, subcategory)}/${encodeSlug(option.slug, 'Option')}`
}

export function buildLegacyTaxonomyFilterPath(args: {
  category: CatalogCategoryPathNode
  subcategory?: Pick<CatalogSubcategoryPathNode, 'slug'> | null
  option?: Pick<CatalogOptionPathNode, 'slug'> | null
}) {
  const path = buildCategoryPath(args.category)
  const params = new URLSearchParams()
  if (args.subcategory) params.set('subcategory', args.subcategory.slug)
  if (args.option) {
    if (!args.subcategory) throw new Error('A legacy option filter requires a subcategory.')
    params.set('option', args.option.slug)
  }
  const query = params.toString()
  return query ? `${path}?${query}` : path
}
