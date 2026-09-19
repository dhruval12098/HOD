import type { Metadata } from 'next';

export const dynamic = 'force-dynamic'
import { notFound, redirect } from 'next/navigation';
import ProductClient from '@/components/pages/ProductClient';
import type { ServiceBannerData } from '@/components/common/ServiceBannerSection';
import { createSupabaseServerClient } from '@/lib/server-supabase';
import { getStorefrontProductBySlug, getStorefrontProducts } from '@/lib/catalog-products';
import { createPageMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { createBreadcrumbSchema, createProductSchema } from '@/lib/structured-data';

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

  const [productsInLane, serviceBanner] = await Promise.all([
    getStorefrontProducts(product.productLane),
    getServiceBanner(),
  ]);

  const relatedProducts = productsInLane
    .filter((item) => item.slug !== slug && item.mainCategorySlug === product.mainCategorySlug && item.productLane === product.productLane)
    .slice(0, 7);

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
      <ProductClient product={product} relatedProducts={relatedProducts} serviceBanner={serviceBanner} />
    </>
  );
}
