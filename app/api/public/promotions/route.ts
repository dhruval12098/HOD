import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server-supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const collectionBucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod'
const publicImageUrl = (path: unknown) => typeof path === 'string' && path ? (/^https?:\/\//.test(path) ? path : `${supabaseUrl}/storage/v1/object/public/${collectionBucket}/${path}`) : ''

export const dynamic = 'force-static'
export const revalidate = 300

export async function GET() {
  const adminClient = createSupabaseServerClient()
  const now = new Date().toISOString()
  const { data, error } = await adminClient
    .from('coupons')
    .select('id, code, title, reward_type, discount_value, minimum_order_amount, gift_product_id, gift_variant_data, gift_banner_image_url, banner_title, banner_description, starts_at, ends_at, featured_priority, usage_limit, usage_count, gift_product:products!coupons_gift_product_id_fkey(id, name, slug, sku, status, stock_quantity, image_1_path)')
    .eq('is_active', true)
    .eq('banner_enabled', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('featured_priority', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Unable to load active offers.' }, { status: 500 })
  const items = (data ?? []).filter((coupon) => coupon.usage_limit == null || Number(coupon.usage_count ?? 0) < Number(coupon.usage_limit)).flatMap((coupon) => {
    const product = Array.isArray(coupon.gift_product) ? coupon.gift_product[0] : coupon.gift_product
    if (coupon.reward_type === 'free_gift' && (!product || product.status !== 'active' || Number(product.stock_quantity ?? 0) < 1)) return []
    const variant = coupon.gift_variant_data && typeof coupon.gift_variant_data === 'object' ? coupon.gift_variant_data as Record<string, unknown> : {}
    return [{
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      rewardType: coupon.reward_type,
      discountValue: Number(coupon.discount_value ?? 0),
      minimumOrderAmount: Number(coupon.minimum_order_amount ?? 0),
      bannerTitle: coupon.banner_title,
      bannerDescription: coupon.banner_description,
      bannerImageUrl: publicImageUrl(coupon.gift_banner_image_url || variant.image_url || product?.image_1_path),
      gift: product ? { name: product.name, slug: product.slug, sku: product.sku, imageUrl: publicImageUrl(variant.image_url || product.image_1_path), variantLabel: variant.label || '' } : null,
      endsAt: coupon.ends_at,
    }]
  })
  return NextResponse.json({ items })
}
