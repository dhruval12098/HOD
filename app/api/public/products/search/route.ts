import { NextResponse } from 'next/server'
import { getStorefrontProductSearchItems } from '@/lib/catalog-products'

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 80) ?? ''
    return NextResponse.json(
      { items: await getStorefrontProductSearchItems(query, query ? 12 : 10) },
      { headers: { 'Cache-Control': 'private, no-store' } }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load product search.' },
      { status: 500 }
    )
  }
}
