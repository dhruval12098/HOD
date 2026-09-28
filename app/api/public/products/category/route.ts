import { NextResponse } from 'next/server'
import { getStorefrontProductCardPage, type StorefrontProductPageFilters, type StorefrontProductSort } from '@/lib/catalog-products'
import { createSupabaseServerClient } from '@/lib/server-supabase'

const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const validSorts = new Set<StorefrontProductSort>(['best-matches', 'price-low', 'price-high', 'best-sellers'])

function optionalSlug(params: URLSearchParams, key: string) {
  const value = params.get(key)
  return value && validSlug.test(value) ? value : null
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams
    const categorySlug = optionalSlug(params, 'category')
    const parsedPage = Number.parseInt(params.get('page') ?? '', 10)
    const page = Number.isSafeInteger(parsedPage) && parsedPage >= 1 && parsedPage <= 100000 ? parsedPage : null

    if (!categorySlug || !page) {
      return NextResponse.json({ error: 'Invalid category page request.' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const categoryResult = await supabase
      .from('catalog_categories')
      .select('category_lane')
      .eq('slug', categorySlug)
      .eq('status', 'active')
      .maybeSingle()
    if (categoryResult.error) throw new Error(categoryResult.error.message)
    if (!categoryResult.data) return NextResponse.json({ error: 'Category not found.' }, { status: 404 })

    const certificate = params.get('certificate')?.trim().slice(0, 100) || null
    const filters: StorefrontProductPageFilters = {
      categorySlug,
      subcategorySlug: optionalSlug(params, 'subcategory'),
      optionSlug: optionalSlug(params, 'option'),
      shapeSlug: optionalSlug(params, 'shape'),
      styleSlug: optionalSlug(params, 'style'),
      metalSlug: optionalSlug(params, 'metal'),
      certificate,
    }
    const requestedSort = params.get('sort') as StorefrontProductSort | null
    const productPage = await getStorefrontProductCardPage({
      productLane: categoryResult.data.category_lane ?? 'standard',
      filters,
      sort: requestedSort && validSorts.has(requestedSort) ? requestedSort : 'best-matches',
      page,
      pageSize: 24,
    })

    return NextResponse.json(productPage, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load category products.' },
      { status: 500 }
    )
  }
}
