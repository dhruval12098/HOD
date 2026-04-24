import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import ShopClient from '@/components/pages/ShopClient';
import { filterStorefrontProducts, getStorefrontProducts } from '@/lib/catalog-products';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our collection of fine jewellery and hip hop jewellery with natural and CVD diamonds.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  noStore()
  const params = await searchParams
  const products = await getStorefrontProducts()
  const filteredProducts = filterStorefrontProducts(products, {
    subcategorySlug: typeof params.subcategory === 'string' ? params.subcategory : null,
    optionSlug: typeof params.option === 'string' ? params.option : null,
    metalSlug: typeof params.metal === 'string' ? params.metal : null,
    purity: typeof params.purity === 'string' ? params.purity : null,
    certificate: typeof params.certificate === 'string' ? params.certificate : null,
  })

  return (
    <ShopClient
      products={filteredProducts}
      sourceProducts={products}
      heroTitle="Our Collection"
      heroSubtitle="Browse our curated selection of fine jewellery, engagement rings, and wedding bands."
      initialFilters={{
        ...(typeof params.category === 'string' ? { category: [params.category] } : {}),
      }}
    />
  );
}
