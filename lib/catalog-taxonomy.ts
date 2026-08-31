import { cache } from 'react'
import { createSupabaseServerClient } from '@/lib/server-supabase'

export type ResolvedCatalogTaxonomy = {
  category: {
    id: string
    name: string
    slug: string
  }
  subcategory: {
    id: string
    category_id: string
    name: string
    slug: string
  }
  option: {
    id: string
    subcategory_id: string
    name: string
    slug: string
  } | null
}

export const resolveCatalogTaxonomy = cache(async (args: {
  categorySlug: string
  subcategorySlug: string
  optionSlug?: string
}): Promise<ResolvedCatalogTaxonomy | null> => {
  const supabase = createSupabaseServerClient()
  const { data: category } = await supabase
    .from('catalog_categories')
    .select('id, name, slug')
    .eq('slug', args.categorySlug)
    .eq('status', 'active')
    .maybeSingle()

  if (!category) return null

  const { data: subcategory } = await supabase
    .from('catalog_subcategories')
    .select('id, category_id, name, slug')
    .eq('category_id', category.id)
    .eq('slug', args.subcategorySlug)
    .eq('status', 'active')
    .maybeSingle()

  if (!subcategory) return null

  if (!args.optionSlug) return { category, subcategory, option: null }

  const { data: option } = await supabase
    .from('catalog_options')
    .select('id, subcategory_id, name, slug')
    .eq('subcategory_id', subcategory.id)
    .eq('slug', args.optionSlug)
    .eq('status', 'active')
    .maybeSingle()

  return option ? { category, subcategory, option } : null
})
