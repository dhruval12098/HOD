import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { unstable_noStore as noStore } from 'next/cache'
import { buildNavbarRenderItems, type NavbarRenderItem } from '@/lib/navbar'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function getServerClient() {
  if (!supabaseUrl) return null

  if (supabaseServiceRoleKey) {
    return createClient(supabaseUrl, supabaseServiceRoleKey)
  }

  if (supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  return null
}

export async function GET() {
  noStore()

  const supabase = getServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }

  const [
    itemsResult,
    sectionsResult,
    linksResult,
    sourceItemsResult,
    featuredResult,
    categoriesResult,
    subcategoriesResult,
    optionsResult,
    metalsResult,
    stoneShapesResult,
    certificatesResult,
    stylesResult,
  ] = await Promise.all([
    supabase.from('navbar_items').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('navbar_sections').select('*').eq('status', 'active').order('column_number', { ascending: true }).order('display_order', { ascending: true }),
    supabase.from('navbar_section_links').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('navbar_section_source_items').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('navbar_featured_cards').select('*'),
    supabase.from('catalog_categories').select('id, name, slug, display_order, status, show_in_nav, nav_type, direct_link_url').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('catalog_subcategories').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('catalog_options').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('catalog_metals').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('catalog_stone_shapes').select('*').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('catalog_certificates').select('*').order('display_order', { ascending: true }),
    supabase.from('catalog_styles').select('*').eq('status', 'active').order('display_order', { ascending: true }),
  ])

  const error =
    itemsResult.error ||
    sectionsResult.error ||
    linksResult.error ||
    sourceItemsResult.error ||
    featuredResult.error ||
    categoriesResult.error ||
    subcategoriesResult.error ||
    optionsResult.error ||
    metalsResult.error ||
    stoneShapesResult.error

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const fallbackItems: NavbarRenderItem[] = (categoriesResult.data ?? [])
    .filter((entry) => entry.show_in_nav !== false)
    .map((entry) => ({
      label: entry.name,
      href: entry.nav_type === 'direct_link' && entry.direct_link_url ? entry.direct_link_url : `/${entry.slug}`,
    }))

  const savedNavItems =
    (itemsResult.data?.length ?? 0) > 0
      ? buildNavbarRenderItems({
          items: itemsResult.data ?? [],
          sections: sectionsResult.data ?? [],
          sectionLinks: linksResult.data ?? [],
          sectionSourceItems: sourceItemsResult.data ?? [],
          featuredCards: featuredResult.data ?? [],
          categories: categoriesResult.data ?? [],
          subcategories: subcategoriesResult.data ?? [],
          options: optionsResult.data ?? [],
          metals: metalsResult.data ?? [],
          stoneShapes: stoneShapesResult.data ?? [],
          certificates: certificatesResult.error ? [] : certificatesResult.data ?? [],
          styles: stylesResult.error ? [] : stylesResult.data ?? [],
        })
      : fallbackItems

  const existingHrefs = new Set(savedNavItems.map((item) => item.href).filter(Boolean))
  const mergedNavItems =
    (itemsResult.data?.length ?? 0) > 0
      ? [
          ...savedNavItems,
          ...fallbackItems.filter((item) => item.href && !existingHrefs.has(item.href)),
        ]
      : fallbackItems

  const activeCategoryIds = new Set((categoriesResult.data ?? []).map((entry) => entry.id))
  const activeCategorySlugs = new Set((categoriesResult.data ?? []).map((entry) => entry.slug))
  const alwaysAllowedHrefs = new Set(['/hiphop', '/bespoke'])

  const visibleNavItems = mergedNavItems.filter((item) => {
    if (item.linkedCategoryId) {
      return activeCategoryIds.has(item.linkedCategoryId)
    }

    if (!item.href) return true
    if (alwaysAllowedHrefs.has(item.href)) return true

    if (item.href.startsWith('/') && !item.href.includes('?')) {
      const slug = item.href.slice(1)
      if (slug && item.mega) {
        return activeCategorySlugs.has(slug)
      }
    }

    return true
  })

  return NextResponse.json(
    { items: visibleNavItems },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}
