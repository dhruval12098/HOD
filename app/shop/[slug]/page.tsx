import type { Metadata } from 'next';

export const dynamic = 'force-dynamic'
import { notFound, redirect } from 'next/navigation';
import ProductClient from '@/components/pages/ProductClient';
import type { ServiceBannerData } from '@/components/common/ServiceBannerSection';
import { createSupabaseServerClient } from '@/lib/server-supabase';
import { getRelatedStorefrontProducts, getStorefrontProductBySlug } from '@/lib/catalog-products';
import { createPageMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { createBreadcrumbSchema, createProductSchema } from '@/lib/structured-data';
import type { StorefrontPromotion } from '@/components/commerce/PromotionBanner';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getServiceBanner(): Promise<ServiceBannerData | null> {
  const supabase = createSupabaseServerClient();
  const [{ data: section, error: sectionError }, { data: blocks, error: blocksError }] = await Promise.all([
    supabase.from('service_banner_section').select('image_path, image_alt').eq('id', 1).eq('is_enabled', true).maybeSingle(),
    supabase.from('service_banner_blocks').select('id, title, paragraph, sort_order').eq('is_active', true).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
  ]);

  if (sectionError || blocksError || !section?.image_path || !blocks?.length) return null;

  const imageUrl = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod')
    .getPublicUrl(section.image_path).data.publicUrl;

  return { imageUrl, imageAlt: section.image_alt ?? '', blocks };
}

async function getFeaturedGiftPromotion(): Promise<StorefrontPromotion | null> {
  const supabase = createSupabaseServerClient();
  const now = new Date().toISOString();
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
    .maybeSingle();

  if (error || !data || (data.usage_limit != null && Number(data.usage_count ?? 0) >= Number(data.usage_limit))) return null;
  const product = Array.isArray(data.gift_product) ? data.gift_product[0] : data.gift_product;
  if (!product || product.status !== 'active' || Number(product.stock_quantity ?? 0) < 1) return null;
  const variant = data.gift_variant_data && typeof data.gift_variant_data === 'object' ? data.gift_variant_data as Record<string, unknown> : {};
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod';
  const toPublicUrl = (path: unknown) => typeof path === 'string' && path
    ? (/^https?:\/\//.test(path) ? path : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl)
    : '';

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
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'This product could not be found.',
    };
  }

  return createPageMetadata({
    title: product.seoTitle || product.name,
    description: product.seoDescription || `${product.shortMeta} - House of Diams`,
    path: `/shop/${product.slug}`,
    image: product.imageUrl,
  });
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    notFound();
  }

  if (product.slug !== slug) {
    redirect(`/shop/${product.slug}`);
  }

  const [relatedProducts, serviceBanner, giftPromotion] = await Promise.all([
    getRelatedStorefrontProducts(product, 7),
    getServiceBanner(),
    getFeaturedGiftPromotion(),
  ]);

  return (
    <>
      <JsonLd
        data={[
          createProductSchema(product),
          createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: product.name, path: `/shop/${product.slug}` },
          ]),
        ]}
      />
      <ProductClient product={product} relatedProducts={relatedProducts} serviceBanner={serviceBanner} giftPromotion={giftPromotion} />
    </>
  );
}
