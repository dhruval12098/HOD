import type { Metadata } from 'next';
import HipHopClient from '@/components/pages/HipHopClient';
import { getStorefrontProducts } from '@/lib/catalog-products';
import { getHipHopHeroData } from '@/lib/hiphop-hero';

export const metadata: Metadata = {
  title: 'Hip Hop',
  description: 'Explore House of Diams hip hop jewellery, including chains, grillz, pendants, and rings.',
};

export default async function HipHopPage() {
  const [products, hero] = await Promise.all([getStorefrontProducts(), getHipHopHeroData()])
  const hiphopProducts = products.filter((product) => product.productLane === 'hiphop')

  return <HipHopClient products={hiphopProducts} hero={hero} />;
}
