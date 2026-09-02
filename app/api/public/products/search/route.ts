import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getStorefrontProductCards } from '@/lib/catalog-products'

export const revalidate = 300

const getSearchItems = unstable_cache(
  async () => {
    const products = await getStorefrontProductCards()
    return products.map((product) => ({
      dbId: product.dbId,
      slug: product.slug,
      name: product.name,
      shortMeta: product.shortMeta,
      imageUrl: product.imageUrl || '',
      priceFrom: product.priceFrom,
    }))
  },
  ['navbar-product-search-items'],
  { revalidate: 300 }
)

export async function GET() {
  try {
    return NextResponse.json(
      { items: await getSearchItems() },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load product search.' },
      { status: 500 }
    )
  }
}
