import { NextResponse } from 'next/server'
import { getNavbarRenderItems } from '@/lib/navbar-server'

export const revalidate = 300
export const dynamic = 'force-static'

export async function GET() {
  try {
    const items = await getNavbarRenderItems()

    return NextResponse.json(
      { items },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load navbar.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}