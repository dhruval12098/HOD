import { NextResponse, type NextRequest } from 'next/server'
import { getMaintenanceMode } from '@/lib/maintenance'

const DETECTED_CURRENCY_COOKIE = 'detected_currency'
const DETECTED_COUNTRY_COOKIE = 'detected_country'
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

const COUNTRY_TO_CURRENCY: Readonly<Record<string, string>> = {
  US: 'USD',
  IN: 'INR',
  AE: 'AED',
  GB: 'GBP',
  AU: 'AUD',
  CA: 'CAD',
  SG: 'SGD',
  JP: 'JPY',
  CN: 'CNY',
  AT: 'EUR',
  BE: 'EUR',
  BG: 'EUR',
  HR: 'EUR',
  CY: 'EUR',
  EE: 'EUR',
  FI: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  GR: 'EUR',
  IE: 'EUR',
  IT: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  LU: 'EUR',
  MT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
  ES: 'EUR',
}

function addDetectedCurrency(request: NextRequest, response: NextResponse) {
  const hasDetectedCurrency = request.cookies.has(DETECTED_CURRENCY_COOKIE)
  const hasDetectedCountry = request.cookies.has(DETECTED_COUNTRY_COOKIE)
  if (hasDetectedCurrency && hasDetectedCountry) return response

  const countryCode = request.headers.get('x-vercel-ip-country')?.trim().toUpperCase()
  if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return response

  const detectedCurrency = countryCode ? COUNTRY_TO_CURRENCY[countryCode] : null
  const cookieOptions = {
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }

  if (!hasDetectedCountry) {
    response.cookies.set({ name: DETECTED_COUNTRY_COOKIE, value: countryCode, ...cookieOptions })
  }

  if (!hasDetectedCurrency && detectedCurrency) {
    response.cookies.set({ name: DETECTED_CURRENCY_COOKIE, value: detectedCurrency, ...cookieOptions })
  }

  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/maintenance') {
    return addDetectedCurrency(request, NextResponse.next())
  }

  const maintenanceMode = await getMaintenanceMode()
  if (!maintenanceMode.enabled) {
    return addDetectedCurrency(request, NextResponse.next())
  }

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = '/maintenance'
  rewriteUrl.searchParams.set('message', maintenanceMode.message)

  return addDetectedCurrency(request, NextResponse.rewrite(rewriteUrl))
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|house-of-diams-favicon.ico|fonts|images|assets|.*\\..*).*)',
  ],
}
