import { NextResponse } from 'next/server'

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country')
  const postalCode = searchParams.get('postalCode')

  const countryCode = normalizeCountryCode(country)
  const normalizedPostalCode = normalizePostalCode(postalCode)

  if (!countryCode || !normalizedPostalCode) {
    return NextResponse.json({ error: 'A supported country and postal code are required.' }, { status: 400 })
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
