import { NextResponse } from 'next/server'
import { getStorefrontProductsByIdentifiers } from '@/lib/catalog-products'

const asStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string').slice(0, 100)
    : []

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const keys = asStringArray(body?.keys)
    const ids = keys.filter((value) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    )
    const slugs = keys.filter((value) => !ids.includes(value))
    const products = await getStorefrontProductsByIdentifiers({
      ids,
      slugs,
      limit: 50,
    })
    return NextResponse.json({
      items: products.map((product) => ({
        id: product.id,
        dbId: product.dbId,
        slug: product.slug,
        name: product.name,
        shortMeta: product.shortMeta,
        priceFrom: product.priceFrom,
        imageUrl: product.imageUrl || '',
        category: product.category,
        featured: product.featured,
        isNew: product.isNew,
        gemColor: product.gemColor,
        gemStyle: product.gemStyle,
        metalsFull: product.metalsFull,
        metalMediaRows: product.metalMediaRows,
        defaultMetalMedia: product.defaultMetalMedia,
        mainCategoryName: product.mainCategoryName,
        mainCategorySlug: product.mainCategorySlug,
      })),
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load products.' }, { status: 500 })
  }
}
