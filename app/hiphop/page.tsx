import type { Metadata } from 'next';
import HipHopClient from '@/components/pages/HipHopClient';
import { getStorefrontProducts } from '@/lib/catalog-products';

export const metadata: Metadata = {
  title: 'Hip Hop',
  description: 'Explore House of Diams hip hop jewellery, including chains, grillz, pendants, and rings.',
};

export default async function HipHopPage() {
  const products = await getStorefrontProducts()
  const hiphopProducts = products.filter((product) => product.category === 'hiphop' || product.detailTemplate === 'hiphop')

  return <HipHopClient products={hiphopProducts} />;
}
