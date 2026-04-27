import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShopClient from '@/components/pages/ShopClient';
import { getStorefrontProducts } from '@/lib/catalog-products';
import { getHomePageData } from '@/lib/home-data';

export const metadata: Metadata = {
  title: 'Collection',
  description: 'Explore House of Diams collection pieces in a dedicated browse-only experience.',
};

export default async function CollectionPage() {
  const { collectionPageConfig } = await getHomePageData();
  if (!collectionPageConfig.pageEnabled) notFound();

  const products = await getStorefrontProducts();
  const collectionProducts = products.filter((product) => product.productLane === 'collection');

  return (
    <ShopClient
      products={collectionProducts}
      sourceProducts={collectionProducts}
      heroTitle={collectionPageConfig.showcaseHeading || 'Collection'}
      heroSubtitle={collectionPageConfig.showcaseSubtitle || 'Browse House of Diams collection pieces in a dedicated enquiry-first showcase.'}
    />
  );
}
