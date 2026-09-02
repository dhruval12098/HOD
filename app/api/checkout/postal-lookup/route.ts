import { NextResponse } from 'next/server'
import { enforceRateLimit } from '@/lib/rate-limit'

type GoogleAddressComponent = {
  long_name?: string
  types?: string[]
}

type GoogleGeocodeResult = {
  formatted_address?: string
  place_id?: string
  address_components?: GoogleAddressComponent[]
}

type GoogleGeocodeResponse = {
  status?: string
  error_message?: string
  results?: GoogleGeocodeResult[]
}

type ZippopotamPlace = {
  'place name'?: string
  state?: string
  'state abbreviation'?: string
}

type ZippopotamResponse = {
  country?: string
  'country abbreviation'?: string
  places?: ZippopotamPlace[]
}

const COUNTRY_ALIASES: Record<string, string> = {
  india: 'IN',
  in: 'IN',
  usa: 'US',
  us: 'US',
  'united states': 'US',
  'united states of america': 'US',
  uk: 'GB',
  gb: 'GB',
  'great britain': 'GB',
  britain: 'GB',
  england: 'GB',
  uae: 'AE',
  ae: 'AE',
  emirates: 'AE',
  'united arab emirates': 'AE',
  australia: 'AU',
  au: 'AU',
  canada: 'CA',
  ca: 'CA',
  germany: 'DE',
  de: 'DE',
  france: 'FR',
  fr: 'FR',
  italy: 'IT',
  it: 'IT',
  spain: 'ES',
  es: 'ES',
  netherlands: 'NL',
  nl: 'NL',
  singapore: 'SG',
  sg: 'SG',
  japan: 'JP',
  jp: 'JP',
}

function normalizeCountryCode(input: string | null) {
  const normalized = (input || '').trim().toLowerCase()
  if (!normalized) return null
  if (COUNTRY_ALIASES[normalized]) return COUNTRY_ALIASES[normalized]
  if (/^[a-z]{2}$/i.test(normalized)) return normalized.toUpperCase()
  return null
}

function normalizePostalCode(input: string | null) {
  const normalized = (input || '').trim()
  if (!normalized) return null
  if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{2,11}$/.test(normalized)) return null
  return normalized
}

function isIndiaCountry(countryCode: string) {
  return countryCode === 'IN'
}

function normalizeIndianPincode(input: string) {
  const digits = input.replace(/\D/g, '')
  return /^\d{6}$/.test(digits) ? digits : null
}

function getGoogleAddressPart(components: GoogleAddressComponent[] = [], types: string[]) {
  return components.find((component) => component.types?.some((type) => types.includes(type)))?.long_name?.trim() || ''
}

function mapGoogleResult(result: GoogleGeocodeResult, index: number) {
  const components = result.address_components ?? []
  const city =
    getGoogleAddressPart(components, ['locality']) ||
    getGoogleAddressPart(components, ['administrative_area_level_2'])
  const district = getGoogleAddressPart(components, ['administrative_area_level_2'])
  const state = getGoogleAddressPart(components, ['administrative_area_level_1'])
  const country = getGoogleAddressPart(components, ['country'])
  const area =
    getGoogleAddressPart(components, ['sublocality_level_1', 'sublocality', 'neighborhood', 'premise']) ||
    result.formatted_address?.split(',')[0]?.trim() ||
    city ||
    district ||
    `Area ${index + 1}`

  return {
    id: result.place_id || `${area}-${index}`,
    label: [area, district || city, state].filter(Boolean).join(', '),
    city,
    district,
    state,
    country,
  }
}

async function lookupPostalCodeWithGoogle(postalCode: string, countryCode?: string | null) {
  const googleGeocodingKey = process.env.GOOGLE_GEOCODING_KEY
  if (!googleGeocodingKey) {
    return NextResponse.json({ error: 'Postal lookup is not configured.' }, { status: 503 })
  }

  const googleUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  googleUrl.searchParams.set(
    'components',
    [`postal_code:${postalCode}`, countryCode ? `country:${countryCode}` : ''].filter(Boolean).join('|')
  )
  googleUrl.searchParams.set('key', googleGeocodingKey)

  try {
    const response = await fetch(googleUrl, {
      headers: { accept: 'application/json' },
      next: { revalidate: 3600 },
    })
    const payload = (await response.json().catch(() => null)) as GoogleGeocodeResponse | null

    if (payload?.status === 'REQUEST_DENIED') {
      console.error('Google Geocoding request denied:', payload.error_message || 'No reason provided')
      return NextResponse.json(
        { error: 'Google postal lookup is not configured correctly. Enable billing and the Geocoding API for the Google Cloud project.' },
        { status: 503 }
      )
    }

    if (!response.ok || (payload?.status && payload.status !== 'OK' && payload.status !== 'ZERO_RESULTS')) {
      return NextResponse.json({ error: 'Postal lookup is unavailable right now.' }, { status: 502 })
    }

    const areas = payload?.status === 'OK' && Array.isArray(payload.results)
      ? payload.results.map(mapGoogleResult).filter((area) => area.city || area.district || area.state || area.country)
      : []

    if (!areas.length) {
      return NextResponse.json({ error: 'Invalid postal code, please check.' }, { status: 404 })
    }

    return NextResponse.json({ areas })
  } catch {
    return NextResponse.json({ error: 'Postal lookup is unavailable right now.' }, { status: 502 })
  }
}

export async function GET(request: Request) {
  const rateLimit = await enforceRateLimit(request, { key: 'checkout-postal-lookup', limit: 30, windowSeconds: 60 })
  if (!rateLimit.ok && rateLimit.response) return rateLimit.response

  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country')
  const postalCode = searchParams.get('postalCode')

  const countryCode = normalizeCountryCode(country)
  const normalizedPostalCode = normalizePostalCode(postalCode)

  if (!normalizedPostalCode) {
    return NextResponse.json({ error: 'A valid postal code is required.' }, { status: 400 })
  }

  if (!countryCode) {
    return lookupPostalCodeWithGoogle(normalizedPostalCode)
  }

  if (isIndiaCountry(countryCode)) {
    const pincode = normalizeIndianPincode(normalizedPostalCode)
    if (!pincode) {
      return NextResponse.json({ error: 'Enter a valid 6-digit Indian PIN code.' }, { status: 400 })
    }
    return lookupPostalCodeWithGoogle(pincode, countryCode)
  }

  try {
    const response = await fetch(
      `https://api.zippopotam.us/${countryCode.toLowerCase()}/${encodeURIComponent(normalizedPostalCode)}`,
      { cache: 'no-store' }
    )

    if (response.status === 404) {
      return NextResponse.json({ error: 'Postal code not found for the selected country.' }, { status: 404 })
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'Postal lookup is unavailable right now.' }, { status: 502 })
    }

    const payload = (await response.json()) as ZippopotamResponse
    const place = payload.places?.[0]
    const city = place?.['place name']?.trim() || ''
    const state = place?.state?.trim() || place?.['state abbreviation']?.trim() || ''

    return NextResponse.json({
      lookup: {
        country: payload.country || country?.trim() || '',
        countryCode: payload['country abbreviation'] || countryCode,
        city,
        state,
        postalCode: normalizedPostalCode,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Postal lookup is unavailable right now.' }, { status: 502 })
  }
}
