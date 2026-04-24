import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ShopClient from '@/components/pages/ShopClient'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { filterStorefrontProducts, getStorefrontProducts } from '@/lib/catalog-products'

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>
}): Promise<Metadata> {
  const { categorySlug } = await params
  const supabase = createSupabaseServerClient()
  const { data: category } = await supabase
    .from('catalog_categories')
    .select('id, name, slug, status')
    .eq('slug', categorySlug)
    .eq('status', 'active')
    .maybeSingle()

  if (!category) {
    return {
      title: 'Collection',
      description: 'Browse our collection.',
    }
  }

  return {
    title: category.name,
    description: `Browse ${category.name} from the live catalog.`,
  }
}

export default async function CategoryCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { categorySlug } = await params
  const supabase = createSupabaseServerClient()
  const { data: category } = await supabase
    .from('catalog_categories')
    .select('id, name, slug, status')
    .eq('slug', categorySlug)
    .eq('status', 'active')
    .maybeSingle()

  if (!category) {
    notFound()
  }

  const query = await searchParams
  const products = await getStorefrontProducts()
  const categoryProducts = filterStorefrontProducts(products, {
    categorySlug,
  })
  const [navbarItemResult, navbarSectionsResult, categorySubcategoriesResult, categoryOptionsResult, ringSizesResult, certificatesResult, metalsResult] =
    await Promise.all([
      supabase.from('navbar_items').select('id, slug, status').eq('slug', categorySlug).eq('status', 'active').maybeSingle(),
      supabase.from('navbar_sections').select('id, navbar_item_id, title, section_type, source_subcategory_id, source_category_slug, show_as_filter, status, display_order, column_number').eq('status', 'active').order('column_number', { ascending: true }).order('display_order', { ascending: true }),
      supabase.from('catalog_subcategories').select('id, name, slug').eq('category_id', category.id).eq('status', 'active').order('display_order', { ascending: true }),
      supabase.from('catalog_options').select('id, subcategory_id, name, slug').eq('status', 'active').order('display_order', { ascending: true }),
      supabase.from('catalog_ring_sizes').select('name').eq('status', 'active').order('display_order', { ascending: true }),
      supabase.from('catalog_certificates').select('name').order('display_order', { ascending: true }),
      supabase.from('catalog_metals').select('name, slug').eq('status', 'active').order('display_order', { ascending: true }),
    ])

  const headerBrowseSections = (() => {
    const navbarItem = navbarItemResult.data
    if (!navbarItem?.id) return []

    const relevantSections = (navbarSectionsResult.data ?? []).filter(
      (section) => section.navbar_item_id === navbarItem.id && section.show_as_filter
    )

    const subcategories = categorySubcategoriesResult.data ?? []
    const options = categoryOptionsResult.data ?? []
    const ringSizes = ringSizesResult.error ? [] : ringSizesResult.data ?? []
    const certificates = certificatesResult.error ? [] : certificatesResult.data ?? []
    const metals = metalsResult.error ? [] : metalsResult.data ?? []

    const groups = relevantSections.map((section) => {
      if (section.section_type === 'category_list' && section.source_subcategory_id) {
        const subcategory = subcategories.find((entry) => entry.id === section.source_subcategory_id)
        const sectionOptions = options
          .filter((entry) => entry.subcategory_id === section.source_subcategory_id)
          .filter((entry) => categoryProducts.some((product) => product.optionSlug === entry.slug))
          .map((entry) => ({
            label: entry.name,
            href: `/${categorySlug}?subcategory=${subcategory?.slug ?? ''}&option=${entry.slug}`,
            type: 'default' as const,
          }))

        return sectionOptions.length
          ? { id: section.id, title: section.title || subcategory?.name || 'Options', options: sectionOptions }
          : null
      }

      if (section.section_type === 'metal_swatches') {
        const sectionOptions = metals
          .filter((entry) => categoryProducts.some((product) => product.metalsFull.some((metal) => metal.slug === entry.slug)))
          .map((entry) => ({
            label: entry.name,
            href: `/${categorySlug}?metal=${entry.slug}`,
            type: 'swatch' as const,
          }))
        return sectionOptions.length ? { id: section.id, title: section.title || 'Metal', options: sectionOptions } : null
      }

      if (section.section_type === 'stone_shapes') {
        const sectionOptions = [
          ...new Set(
            categoryProducts
              .map((product) => product.optionName || product.gemstoneValue || '')
              .filter(Boolean)
          ),
        ].map((value) => ({
          label: value,
          href: `/${categorySlug}`,
          type: 'default' as const,
        }))

        return sectionOptions.length ? { id: section.id, title: section.title || 'Stone Shapes', options: sectionOptions } : null
      }

      if (section.section_type === 'certificates') {
        const sectionOptions = certificates
          .filter((entry) => categoryProducts.some((product) => (product.certificateNames || []).includes(entry.name)))
          .map((entry) => ({
            label: entry.name,
            href: `/${categorySlug}?certificate=${slugifyValue(entry.name)}`,
            type: 'default' as const,
          }))
        return sectionOptions.length ? { id: section.id, title: section.title || 'Certificate', options: sectionOptions } : null
      }

      if (section.section_type === 'ring_sizes') {
        const sectionOptions = ringSizes
          .filter((entry) => categoryProducts.some((product) => (product.ringSizeNames || []).includes(entry.name)))
          .map((entry) => ({
            label: entry.name,
            href: `/${categorySlug}?size=${slugifyValue(entry.name)}`,
            type: 'default' as const,
          }))
        return sectionOptions.length ? { id: section.id, title: section.title || 'Ring Size', options: sectionOptions } : null
      }

      return null
    })

    return groups.filter(Boolean) as { id: string; title: string; options: { label: string; href: string; type?: 'default' | 'swatch' }[] }[]
  })()

  const certificateFilterValue =
    typeof query.certificate === 'string'
      ? (certificatesResult.error ? [] : certificatesResult.data ?? []).find((entry) => slugifyValue(entry.name) === query.certificate)?.name ?? query.certificate
      : null

  const filteredProducts = filterStorefrontProducts(categoryProducts, {
    categorySlug,
    subcategorySlug: typeof query.subcategory === 'string' ? query.subcategory : null,
    optionSlug: typeof query.option === 'string' ? query.option : null,
    metalSlug: typeof query.metal === 'string' ? query.metal : null,
    purity: typeof query.purity === 'string' ? query.purity : null,
    certificate: typeof query.certificate === 'string' ? query.certificate : null,
  })

  return (
    <ShopClient
      products={filteredProducts}
      sourceProducts={categoryProducts}
      heroTitle={category.name}
      heroSubtitle={`Browse ${category.name} from the live catalog.`}
      headerBrowseSections={headerBrowseSections}
      initialFilters={{
        ...(typeof query.option === 'string' ? { option: [query.option] } : {}),
        ...(typeof query.metal === 'string' ? { metal: [query.metal] } : {}),
        ...(certificateFilterValue ? { certificate: [certificateFilterValue] } : {}),
        ...(typeof query.size === 'string' ? { size: [query.size] } : {}),
      }}
    />
  )
}
