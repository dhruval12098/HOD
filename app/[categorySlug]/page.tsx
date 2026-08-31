import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import ShopClient from '@/components/pages/ShopClient'
import { buildNavbarRenderItems } from '@/lib/navbar'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { filterStorefrontProducts, getStorefrontProducts, toStorefrontProductCard } from '@/lib/catalog-products'
import { createPageMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import { createBreadcrumbSchema } from '@/lib/structured-data'
import { buildCategoryPath, buildOptionPath, buildSubcategoryPath } from '@/lib/catalog-paths'
import type { ResolvedCatalogTaxonomy } from '@/lib/catalog-taxonomy'

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function toPublicUrl(path: string | null | undefined) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  if (!supabaseUrl) return path
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod'
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
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

async function loadNavbarItems(client: SupabaseClient) {
  return client
    .from('navbar_items')
    .select('*')
    .eq('status', 'active')
    .order('display_order', { ascending: true })
}

const getCategoryBySlug = cache(async (slug: string) => {
  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('catalog_categories')
    .select('id, name, slug, status, category_lane, banner_desktop_image_path, banner_mobile_image_path, banner_title, banner_subtitle, banner_cta_label, banner_cta_link, banner_enabled')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()

  return data
})

const getCategoryReferenceData = unstable_cache(
  async () => {
    const client = getPublicNavbarDataClient() ?? createSupabaseServerClient()

    return Promise.all([
      loadNavbarItems(client),
      client.from('navbar_sections').select('*').eq('status', 'active').order('column_number', { ascending: true }).order('display_order', { ascending: true }),
      client.from('navbar_section_links').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      client.from('navbar_section_source_items').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      client.from('navbar_featured_cards').select('*'),
      client.from('catalog_categories').select('id, name, slug, display_order, status').eq('status', 'active').order('display_order', { ascending: true }),
      client.from('catalog_subcategories').select('id, category_id, name, slug, icon_svg_path, display_order, status').eq('status', 'active').order('display_order', { ascending: true }),
      client.from('catalog_options').select('id, subcategory_id, name, slug, icon_svg_path, display_order, status').eq('status', 'active').order('display_order', { ascending: true }),
      client.from('catalog_certificates').select('*').order('display_order', { ascending: true }),
      client.from('catalog_metals').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      client.from('catalog_stone_shapes').select('*').eq('status', 'active').order('display_order', { ascending: true }),
      client.from('catalog_styles').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    ])
  },
  ['category-page-reference-data'],
  { revalidate: 300 }
)

const getCategoryGridPosters = unstable_cache(
  async (categoryId: string) => {
    const supabase = createSupabaseServerClient()
    const result = await supabase
      .from('category_grid_posters')
      .select('id, title, image_path, image_alt, link_url, insert_after, display_order, status, starts_at, ends_at')
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order('display_order', { ascending: true })

    if (result.error) return result

    const now = Date.now()
    return {
      ...result,
      data: (result.data ?? []).filter((poster) => {
        const startsAt = poster.starts_at ? Date.parse(poster.starts_at) : null
        const endsAt = poster.ends_at ? Date.parse(poster.ends_at) : null
        return (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now)
      }),
    }
  },
  ['category-grid-posters'],
  { revalidate: 60 }
)

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

function deriveSectionFilterHref(
  options: { href: string }[],
  currentCategorySlug: string
) {
  for (const option of options) {
    try {
      const target = new URL(option.href, 'https://houseofdiams.local')
      const subcategory = target.searchParams.get('subcategory')
      if (subcategory) return `/${currentCategorySlug}?subcategory=${subcategory}`

      const segments = target.pathname.split('/').filter(Boolean)
      if (segments[0] === currentCategorySlug && segments[1]) {
        return `/${currentCategorySlug}/${segments[1]}`
      }
    } catch {}
  }

  return null
}

const filterQueryKeys = ['subcategory', 'option', 'shape', 'style', 'metal', 'certificate', 'sort', 'page'] as const

function hasFilterQuery(params: Record<string, string | string[] | undefined>) {
  return filterQueryKeys.some((key) => typeof params[key] === 'string' && Boolean(params[key]))
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

  if (!hasFilterQuery(query)) return metadata

  return {
    ...metadata,
    robots: {
      index: false,
      follow: true,
    },
  }
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

  return hasFilterQuery(query)
    ? { ...metadata, robots: { index: false, follow: true } }
    : metadata
}

export default async function CategoryCollectionPage({
  params,
  searchParams,
  taxonomy = null,
}: {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
  taxonomy?: ResolvedCatalogTaxonomy | null
}) {
  const { categorySlug } = await params
  const category = await getCategoryBySlug(categorySlug)

  if (!category) {
    notFound()
  }

  const query = await searchParams
  const resolvedProductLane = category.category_lane ?? 'standard'
  const [products, referenceData, gridPostersResult] = await Promise.all([
    getStorefrontProducts(resolvedProductLane),
    getCategoryReferenceData(),
    getCategoryGridPosters(category.id),
  ])
  const categoryProducts = filterStorefrontProducts(products, {
    productLane: resolvedProductLane,
    categorySlug,
  })
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
  ] = referenceData

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
        href: deriveSectionFilterHref(allOptions, categorySlug),
        options: allOptions,
      }
    })

    const navbarBrowseSections = uniqueBrowseSections(contentSections)

    if (navbarBrowseSections.length > 0) {
      return navbarBrowseSections
    }

    const fallbackSubcategories = subcategories
      .filter((entry) => entry.category_id === category.id)
      .sort((left, right) => left.display_order - right.display_order)

    const fallbackSections = fallbackSubcategories.map((subcategory) => {
      const subcategoryOptions = options
        .filter((entry) => entry.subcategory_id === subcategory.id)
        .sort((left, right) => left.display_order - right.display_order)

      return {
        id: `fallback-${subcategory.id}`,
        title: subcategory.name,
        iconUrl: toPublicUrl(subcategory.icon_svg_path) ?? null,
        href: buildSubcategoryPath(category, subcategory),
        options: subcategoryOptions.map((option) => ({
          label: option.name,
          href: buildOptionPath(category, subcategory, option),
          type: option.icon_svg_path ? ('icon' as const) : ('default' as const),
          iconUrl: toPublicUrl(option.icon_svg_path) ?? null,
        })),
      }
    })

    return uniqueBrowseSections(fallbackSections.filter((section) => section.options.length > 0))
  })()

  const certificateFilterValue =
    typeof query.certificate === 'string'
      ? (certificatesResult.error ? [] : certificatesResult.data ?? []).find((entry) => slugifyValue(entry.name) === query.certificate)?.name ?? query.certificate
      : null

  const filteredProducts = filterStorefrontProducts(categoryProducts, {
    productLane: resolvedProductLane,
    categorySlug,
    subcategorySlug: taxonomy?.subcategory.slug ?? (typeof query.subcategory === 'string' ? query.subcategory : null),
    optionSlug: taxonomy?.option?.slug ?? (typeof query.option === 'string' ? query.option : null),
    shapeSlug: typeof query.shape === 'string' ? query.shape : null,
    styleSlug: typeof query.style === 'string' ? query.style : null,
    metalSlug: typeof query.metal === 'string' ? query.metal : null,
    certificate: typeof query.certificate === 'string' ? query.certificate : null,
  })

  return (
    <>
      <JsonLd
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: category.name, path: buildCategoryPath(category) },
          ...(taxonomy
            ? [{ name: taxonomy.subcategory.name, path: buildSubcategoryPath(taxonomy.category, taxonomy.subcategory) }]
            : []),
          ...(taxonomy?.option
            ? [{ name: taxonomy.option.name, path: buildOptionPath(taxonomy.category, taxonomy.subcategory, taxonomy.option) }]
            : []),
        ])}
      />
      <ShopClient
        products={filteredProducts.map(toStorefrontProductCard)}
        sourceProducts={categoryProducts.map(toStorefrontProductCard)}
        heroTitle={taxonomy?.option?.name ?? taxonomy?.subcategory.name ?? category.banner_title ?? category.name}
        heroSubtitle={category.banner_subtitle || `Browse ${category.name} from the live catalog.`}
        heroDesktopImageUrl={toPublicUrl(category.banner_desktop_image_path) || undefined}
        heroMobileImageUrl={toPublicUrl(category.banner_mobile_image_path) || undefined}
        heroCtaLabel={category.banner_cta_label || undefined}
        heroCtaHref={category.banner_cta_link || undefined}
        heroBannerEnabled={Boolean(category.banner_enabled)}
        gridPosters={(gridPostersResult.error ? [] : gridPostersResult.data ?? [])
          .map((poster) => ({
            id: poster.id,
            title: poster.title,
            imageUrl: toPublicUrl(poster.image_path) || poster.image_path,
            imageAlt: poster.image_alt,
            linkUrl: poster.link_url,
            insertAfter: poster.insert_after ?? 6,
            displayOrder: poster.display_order ?? 0,
          }))}
        headerBrowseSections={headerBrowseSections}
        initialFilters={{
          ...(taxonomy?.subcategory.slug
            ? { subcategory: [taxonomy.subcategory.slug] }
            : typeof query.subcategory === 'string' ? { subcategory: [query.subcategory] } : {}),
          ...(taxonomy?.option?.slug
            ? { option: [taxonomy.option.slug] }
            : typeof query.option === 'string' ? { option: [query.option] } : {}),
          ...(typeof query.shape === 'string' ? { shape: [query.shape] } : {}),
          ...(typeof query.style === 'string' ? { style: [query.style] } : {}),
          ...(typeof query.metal === 'string' ? { metal: [query.metal] } : {}),
          ...(certificateFilterValue ? { certificate: [certificateFilterValue] } : {}),
        }}
        initialPage={typeof query.page === 'string' ? Math.max(1, Number.parseInt(query.page, 10) || 1) : 1}
      />
    </>
  )
}
