import type { Metadata } from 'next';

export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation';
import ShopClient from '@/components/pages/ShopClient';
import { getStorefrontProducts, toStorefrontProductCard } from '@/lib/catalog-products';
import { getHomePageData } from '@/lib/home-data';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Collection',
  description: 'Explore House of Diams collection pieces in a dedicated browse-only experience.',
  path: '/collection',
});

export default async function CollectionPage() {
  const { collectionPageConfig } = await getHomePageData();
  if (!collectionPageConfig.pageEnabled) notFound();

  const products = await getStorefrontProducts('collection');
  const collectionProducts = products.map(toStorefrontProductCard);

  return (
    <ShopClient
      products={collectionProducts}
      sourceProducts={collectionProducts}
      heroTitle={collectionPageConfig.showcaseHeading || 'Collection'}
      heroSubtitle={collectionPageConfig.showcaseSubtitle || 'Browse House of Diams collection pieces in a dedicated enquiry-first showcase.'}
    />
  );
}
