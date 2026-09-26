import type { Metadata } from 'next';
import HomeClient from '@/components/pages/HomeClient';
import { mapBlogPostRecord, posts as fallbackPosts } from '@/lib/data/blog-posts';
import { getFreshHomeHeroContent, getHomePageData, getHomeSeoData } from '@/lib/home-data';
import { createPageMetadata } from '@/lib/seo';
import { getFreshShopByCategory } from '@/lib/shop-by-category';
import { createSupabaseServerClient } from '@/lib/server-supabase';
import type { StorefrontPromotion } from '@/components/commerce/PromotionBanner';

type BlogTagRow = { tag: string; sort_order: number | null }
type BlogPostRow = {
  id: number
  slug: string
  category: string
  author: string
  date_label: string
  read_time: string
  bg_key: string
  bg_color: string
  title: string
  title_html: string
  subtitle: string
  body_html: string
  hero_image_path: string | null
  is_published: boolean
  sort_order: number | null
  blog_post_tags: BlogTagRow[] | null
}

async function getFeaturedGiftPromotion(): Promise<StorefrontPromotion | null> {
  const supabase = createSupabaseServerClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('coupons')
    .select('id, code, title, reward_type, discount_value, minimum_order_amount, gift_variant_data, gift_banner_image_url, banner_title, banner_description, ends_at, usage_limit, usage_count, gift_product:products!coupons_gift_product_id_fkey(id, name, slug, sku, status, stock_quantity, image_1_path)')
    .eq('is_active', true)
    .eq('banner_enabled', true)
    .eq('reward_type', 'free_gift')
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('featured_priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data || (data.usage_limit != null && Number(data.usage_count ?? 0) >= Number(data.usage_limit))) return null
  const product = Array.isArray(data.gift_product) ? data.gift_product[0] : data.gift_product
  if (!product || product.status !== 'active' || Number(product.stock_quantity ?? 0) < 1) return null
  const variant = data.gift_variant_data && typeof data.gift_variant_data === 'object' ? data.gift_variant_data as Record<string, unknown> : {}
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod'
  const toPublicUrl = (path: unknown) => typeof path === 'string' && path
    ? (/^https?:\/\//.test(path) ? path : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl)
    : ''

  return {
    id: data.id,
    code: data.code,
    title: data.title,
    rewardType: 'free_gift',
    discountValue: Number(data.discount_value ?? 0),
    minimumOrderAmount: Number(data.minimum_order_amount ?? 0),
    bannerTitle: data.banner_title,
    bannerDescription: data.banner_description,
    bannerImageUrl: toPublicUrl(data.gift_banner_image_url || variant.image_url || product.image_1_path),
    gift: { name: product.name, slug: product.slug, sku: product.sku, imageUrl: toPublicUrl(variant.image_url || product.image_1_path), variantLabel: typeof variant.label === 'string' ? variant.label : '' },
    endsAt: data.ends_at,
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getHomeSeoData();

  return createPageMetadata({
    title: seo.title || 'Luxury Diamond Jewellery',
    description: seo.description || 'House of Diams creates certified lab-grown diamond jewellery, including engagement rings, wedding bands, T-bar jewellery, and bespoke commissions.',
    path: '/',
  });
}

export default async function Home() {
  const freshHeroContentPromise = getFreshHomeHeroContent().catch(() => undefined);
  const shopByCategoryPromise = getFreshShopByCategory().catch(() => null);
  const giftPromotionPromise = getFeaturedGiftPromotion().catch(() => null);
  const {
    heroContent,
    blogRows,
    discoverShapesItems,
    hiphopSection,
    collectionPageConfig,
    bespokeShowcaseSection,
    instagramReels,
    diamondInfoItems,
    diamondInfoConfig,
    marqueeData,
    trustedPartnersData,
    bestSellerSection,
    bestSellerProducts,
  } = await getHomePageData();
  const freshHeroContent = await freshHeroContentPromise;
  const shopByCategory = await shopByCategoryPromise;
  const giftPromotion = await giftPromotionPromise;

  const blogPosts = ((blogRows as BlogPostRow[] | null)?.map((row) =>
    mapBlogPostRecord({
      ...row,
      hero_image_path: row.hero_image_path ?? undefined,
      sort_order: row.sort_order ?? undefined,
      tags: (row.blog_post_tags ?? [])
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((tag) => tag.tag),
    })
  ) ?? fallbackPosts)

  return (
    <HomeClient
      heroContent={freshHeroContent ?? heroContent}
      shopByCategory={shopByCategory}
      blogPosts={blogPosts}
      discoverShapesItems={discoverShapesItems}
      hiphopSection={hiphopSection}
      collectionPageConfig={collectionPageConfig}
      bespokeShowcaseSection={bespokeShowcaseSection}
      instagramReels={instagramReels}
      diamondInfoItems={diamondInfoItems}
      diamondInfoConfig={diamondInfoConfig}
      marqueeData={marqueeData}
      trustedPartnersData={trustedPartnersData}
      bestSellerSection={bestSellerSection}
      bestSellerProducts={bestSellerProducts}
      giftPromotion={giftPromotion}
    />
  );
}
