import { NextResponse } from 'next/server'
import { getStorefrontProducts } from '@/lib/catalog-products'

export async function GET() {
  try {
    const products = await getStorefrontProducts()
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
        mainCategoryName: product.mainCategoryName,
        mainCategorySlug: product.mainCategorySlug,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load products.' }, { status: 500 })
  }
}
