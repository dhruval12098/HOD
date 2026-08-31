import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getMaintenanceMode } from '@/lib/maintenance'
import { currencyForCountry, normalizeCountryCode } from '@/lib/country-currency'

const DETECTED_CURRENCY_COOKIE = 'detected_currency'
const DETECTED_COUNTRY_COOKIE = 'detected_country'
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function addDetectedCurrency(request: NextRequest, response: NextResponse) {
  const countryCode = normalizeCountryCode(request.headers.get('x-vercel-ip-country'))
  if (!countryCode) return response

  const detectedCurrency = currencyForCountry(countryCode)
  const cookieOptions = {
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }

  response.cookies.set({ name: DETECTED_COUNTRY_COOKIE, value: countryCode, ...cookieOptions })
  response.cookies.set({ name: DETECTED_CURRENCY_COOKIE, value: detectedCurrency, ...cookieOptions })
  return response
}

type TaxonomyRow = { id: string; slug: string }

function getSupabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return key ? { apikey: key, Authorization: `Bearer ${key}` } : null
}

async function findOne(table: string, filters: Record<string, string>) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const headers = getSupabaseHeaders()
  if (!baseUrl || !headers) return null

  const url = new URL(`/rest/v1/${table}`, baseUrl)
  url.searchParams.set('select', 'id,slug')
  url.searchParams.set('limit', '1')
  for (const [key, value] of Object.entries(filters)) {
    url.searchParams.set(key, `eq.${value}`)
  }

  const response = await fetch(url, { headers, cache: 'no-store' })
  if (!response.ok) return null
  const rows = (await response.json()) as TaxonomyRow[]
  return rows[0] ?? null
}

async function getStoredSeoRedirect(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const headers = getSupabaseHeaders()
  if (!baseUrl || !headers) return null

  const sourcePath = `${request.nextUrl.pathname}${request.nextUrl.search}`
  const url = new URL('/rest/v1/seo_redirects', baseUrl)
  url.searchParams.set('select', 'target_path')
  url.searchParams.set('source_path', `eq.${sourcePath}`)
  url.searchParams.set('is_active', 'eq.true')
  url.searchParams.set('limit', '1')

  let response: Response
  try {
    response = await fetch(url, { headers, cache: 'no-store' })
  } catch {
    return null
  }
  if (!response.ok) return null
  const rows = (await response.json()) as { target_path: string }[]
  const redirect = rows[0]
  if (!redirect) return null

  const target = request.nextUrl.clone()
  target.pathname = redirect.target_path
  target.search = ''
  return NextResponse.redirect(target, 301)
}

async function getLegacyTaxonomyRedirect(request: NextRequest) {
  const { nextUrl } = request
  const segments = nextUrl.pathname.split('/').filter(Boolean)
  if (segments.length !== 1) return null

  const keys = [...nextUrl.searchParams.keys()]
  const allowedKeys = new Set(['subcategory', 'option'])
  if (keys.length === 0 || keys.some((key) => !allowedKeys.has(key))) return null

  const subcategorySlug = nextUrl.searchParams.get('subcategory')
  const optionSlug = nextUrl.searchParams.get('option')
  if (!subcategorySlug || keys.length !== (optionSlug ? 2 : 1)) return null

  const category = await findOne('catalog_categories', { slug: segments[0], status: 'active' })
  if (!category) return null

  const subcategory = await findOne('catalog_subcategories', {
    category_id: category.id,
    slug: subcategorySlug,
    status: 'active',
  })
  if (!subcategory) return null

  const target = request.nextUrl.clone()
  target.search = ''
  target.pathname = `/${encodeURIComponent(category.slug)}/${encodeURIComponent(subcategory.slug)}`

  if (optionSlug) {
    const option = await findOne('catalog_options', {
      subcategory_id: subcategory.id,
      slug: optionSlug,
      status: 'active',
    })
    if (!option) return null
    target.pathname += `/${encodeURIComponent(option.slug)}`
  }

  return NextResponse.redirect(target, 301)
}

async function getInvalidTaxonomyResponse(request: NextRequest) {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean)
  if (segments.length !== 2 && segments.length !== 3) return null

  const category = await findOne('catalog_categories', { slug: segments[0], status: 'active' })
  if (!category) return null

  const subcategory = await findOne('catalog_subcategories', {
    category_id: category.id,
    slug: segments[1],
    status: 'active',
  })
  if (!subcategory) return new NextResponse(null, { status: 404 })
  if (segments.length === 2) return null

  const option = await findOne('catalog_options', {
    subcategory_id: subcategory.id,
    slug: segments[2],
    status: 'active',
  })
  return option ? null : new NextResponse(null, { status: 404 })
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/maintenance') {
    return addDetectedCurrency(request, NextResponse.next())
  }

  const maintenanceMode = await getMaintenanceMode()
  if (maintenanceMode.enabled) {
    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = '/maintenance'
    rewriteUrl.searchParams.set('message', maintenanceMode.message)
    return addDetectedCurrency(request, NextResponse.rewrite(rewriteUrl))
  }

  const storedRedirect = await getStoredSeoRedirect(request)
  if (storedRedirect) return addDetectedCurrency(request, storedRedirect)

  const invalidTaxonomyResponse = await getInvalidTaxonomyResponse(request)
  if (invalidTaxonomyResponse) return addDetectedCurrency(request, invalidTaxonomyResponse)

  const taxonomyRedirect = await getLegacyTaxonomyRedirect(request)
  return addDetectedCurrency(request, taxonomyRedirect ?? NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|house-of-diams-favicon.ico|fonts|images|assets|.*\\..*).*)',
  ],
}
