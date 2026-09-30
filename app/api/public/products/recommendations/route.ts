import { NextResponse } from 'next/server'
import { getStorefrontCartRecommendations } from '@/lib/catalog-products'

const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string').slice(0, 50)
    : []

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const requestedLimit = Number(body?.limit)
    const limit = Number.isFinite(requestedLimit) ? Math.min(4, Math.max(1, Math.floor(requestedLimit))) : 4
    const items = await getStorefrontCartRecommendations({
      slugs: asStringArray(body?.slugs),
      ids: asStringArray(body?.ids),
      limit,
    })

    return NextResponse.json(
      { items },
      { headers: { 'Cache-Control': 'private, max-age=60' } }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load recommendations.' },
      { status: 500 }
    )
  }
}
