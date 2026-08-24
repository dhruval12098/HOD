import { NextResponse, type NextRequest } from 'next/server'
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
