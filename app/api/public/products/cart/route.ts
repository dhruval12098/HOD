import { NextResponse } from 'next/server'
import { getStorefrontProducts } from '@/lib/catalog-products'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const slugs = Array.isArray(body?.slugs) ? body.slugs.filter((value: unknown): value is string => typeof value === 'string').slice(0, 50) : []
  const ids = Array.isArray(body?.ids) ? body.ids.filter((value: unknown): value is string => typeof value === 'string').slice(0, 50) : []
  if (!slugs.length && !ids.length) return NextResponse.json({ items: [] })
  const wantedSlugs = new Set(slugs)
  const wantedIds = new Set(ids)
  const products = await getStorefrontProducts()
  return NextResponse.json({ items: products.filter((product) => wantedSlugs.has(product.slug) || wantedIds.has(product.dbId) || wantedIds.has(String(product.id))).map((product) => ({ id: String(product.id), dbId: product.dbId, slug: product.slug, name: product.name, shortMeta: product.shortMeta, imageUrl: product.imageUrl || '', priceFrom: product.priceFrom })) })
}
