import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ShopClient from '@/components/pages/ShopClient'
import { buildNavbarRenderItems } from '@/lib/navbar'
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getPublicNavbarDataClient() {
  if (!supabaseUrl) return null

  if (supabaseServiceRoleKey) {
    return createClient(supabaseUrl, supabaseServiceRoleKey)
  }

  if (supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  return null
}

function uniqueSectionOptions(
  options: { label: string; href: string; type?: 'default' | 'swatch' | 'icon'; iconUrl?: string | null; colorHex?: string | null }[]
) {
  const seen = new Set<string>()
  return options.filter((option) => {
    const key = `${option.label}::${option.href}::${option.type ?? 'default'}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function uniqueBrowseSections<T extends { id: string; title: string; href?: string | null }>(sections: T[]) {
  const seen = new Set<string>()
  return sections.filter((section) => {
    const key = `${section.title}::${section.href ?? ''}::${section.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function resolveMasterFilterHref(args: {
  href: string
  currentCategorySlug: string
  categoryProducts: Awaited<ReturnType<typeof getStorefrontProducts>>
  allProducts: Awaited<ReturnType<typeof getStorefrontProducts>>
}) {
  const { href, currentCategorySlug, categoryProducts, allProducts } = args

  if (!href.startsWith('/shop?')) return href

  const search = href.split('?')[1] ?? ''
  const params = new URLSearchParams(search)
  const optionSlug = params.get('option')
  const shapeSlug = params.get('shape')
  const styleSlug = params.get('style')
  const metalSlug = params.get('metal')
  const certificate = params.get('certificate')

  const currentMatches = filterStorefrontProducts(categoryProducts, {
    categorySlug: currentCategorySlug,
    optionSlug,
    shapeSlug,
    styleSlug,
    metalSlug,
    certificate,
  })

  if (currentMatches.length > 0) {
    return `/${currentCategorySlug}?${params.toString()}`
  }

  const globalMatches = filterStorefrontProducts(allProducts, {
    optionSlug,
    shapeSlug,
    styleSlug,
    metalSlug,
    certificate,
  })

  const nextCategorySlug = globalMatches[0]?.mainCategorySlug
  if (nextCategorySlug) {
    return `/${nextCategorySlug}?${params.toString()}`
  }

  return href
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
    productLane: 'standard',
    categorySlug,
  })
  const publicNavbarClient = getPublicNavbarDataClient() ?? supabase
  const [
    navbarItemsResult,
    navbarSectionsResult,
    navbarLinksResult,
    navbarSourceItemsResult,
    navbarFeaturedResult,
    categoriesResult,
    categorySubcategoriesResult,
    categoryOptionsResult,
    certificatesResult,
    metalsResult,
    stoneShapesResult,
    stylesResult,
  ] =
    await Promise.all([
      publicNavbarClient.from('navbar_items').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      publicNavbarClient.from('navbar_sections').select('*').eq('status', 'active').order('column_number', { ascending: true }).order('display_order', { ascending: true }),
      publicNavbarClient.from('navbar_section_links').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      publicNavbarClient.from('navbar_section_source_items').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      publicNavbarClient.from('navbar_featured_cards').select('*'),
      publicNavbarClient.from('catalog_categories').select('id, name, slug, display_order, status').eq('status', 'active').order('display_order', { ascending: true }),
      publicNavbarClient.from('catalog_subcategories').select('id, category_id, name, slug, icon_svg_path, display_order, status').eq('status', 'active').order('display_order', { ascending: true }),
      publicNavbarClient.from('catalog_options').select('id, subcategory_id, name, slug, icon_svg_path, display_order, status').eq('status', 'active').order('display_order', { ascending: true }),
      publicNavbarClient.from('catalog_certificates').select('*').order('display_order', { ascending: true }),
      publicNavbarClient.from('catalog_metals').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      publicNavbarClient.from('catalog_stone_shapes').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      publicNavbarClient.from('catalog_styles').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    ])

  const headerBrowseSections = (() => {
    const navbarItems = navbarItemsResult.data ?? []
    const navbarSections = navbarSectionsResult.data ?? []
    const navbarLinks = navbarLinksResult.data ?? []
    const navbarSourceItems = navbarSourceItemsResult.data ?? []
    const navbarFeatured = navbarFeaturedResult.data ?? []
    const subcategories = categorySubcategoriesResult.data ?? []
    const options = categoryOptionsResult.data ?? []
    const certificates = certificatesResult.error ? [] : (certificatesResult.data ?? []).map((entry, index) => ({ id: `${index}-${entry.name}`, name: entry.name, status: 'active' as const }))
    const metals = metalsResult.error ? [] : (metalsResult.data ?? []).map((entry, index) => ({ id: `${index}-${entry.slug}`, ...entry, display_order: index, status: 'active' as const }))
    const stoneShapes = stoneShapesResult.error ? [] : (stoneShapesResult.data ?? []).map((entry, index) => ({ id: `${index}-${entry.slug}`, ...entry, display_order: index, status: 'active' as const }))
    const styles = stylesResult.error ? [] : stylesResult.data ?? []

    const renderItems = buildNavbarRenderItems({
      items: navbarItems,
      sections: navbarSections,
      sectionLinks: navbarLinks,
      sectionSourceItems: navbarSourceItems,
      featuredCards: navbarFeatured,
      categories: categoriesResult.error ? [{ ...category, display_order: 0 }] : categoriesResult.data ?? [{ ...category, display_order: 0 }],
      subcategories,
      options,
      metals,
      stoneShapes,
      certificates,
      styles,
    })

    const matchedItem = renderItems.find((entry) => entry.linkedCategoryId === category.id || entry.slug === category.slug)
    const filterSections = (matchedItem?.mega?.sections ?? []).filter((section) => section.showAsFilter)

    const contentSections = filterSections.map((section) => {
      const allOptions = uniqueSectionOptions([
        ...(section.metals ?? []).map((metal) => ({
          label: metal.label,
          href: resolveMasterFilterHref({
            href: metal.href,
            currentCategorySlug: categorySlug,
            categoryProducts,
            allProducts: products,
          }),
          type: 'swatch' as const,
          colorHex: metal.colorHex ?? null,
        })),
        ...((section.links ?? [])
          .filter((link) => !link.isCategoryLink)
          .map((link) => ({
            label: link.label,
            href: resolveMasterFilterHref({
              href: link.href,
              currentCategorySlug: categorySlug,
              categoryProducts,
              allProducts: products,
            }),
            type: link.type ?? 'default',
            iconUrl: link.iconUrl ?? null,
            colorHex: link.colorHex ?? null,
          }))),
      ])

      return {
        id: section.id,
        title: section.title,
        iconUrl: section.iconUrl,
        options: allOptions,
      }
    })

    return uniqueBrowseSections(contentSections)
  })()

  const certificateFilterValue =
    typeof query.certificate === 'string'
      ? (certificatesResult.error ? [] : certificatesResult.data ?? []).find((entry) => slugifyValue(entry.name) === query.certificate)?.name ?? query.certificate
      : null

  const filteredProducts = filterStorefrontProducts(categoryProducts, {
    productLane: 'standard',
    categorySlug,
    subcategorySlug: typeof query.subcategory === 'string' ? query.subcategory : null,
    optionSlug: typeof query.option === 'string' ? query.option : null,
    shapeSlug: typeof query.shape === 'string' ? query.shape : null,
    styleSlug: typeof query.style === 'string' ? query.style : null,
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
        ...(typeof query.shape === 'string' ? { shape: [query.shape] } : {}),
        ...(typeof query.style === 'string' ? { style: [query.style] } : {}),
        ...(typeof query.metal === 'string' ? { metal: [query.metal] } : {}),
        ...(certificateFilterValue ? { certificate: [certificateFilterValue] } : {}),
      }}
    />
  )
}
