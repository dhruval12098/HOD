import type { Metadata } from 'next';

export const dynamic = 'force-dynamic'
import { unstable_noStore as noStore } from 'next/cache';
import ShopClient from '@/components/pages/ShopClient';
import { filterStorefrontProducts, getStorefrontProducts, toStorefrontProductCard } from '@/lib/catalog-products';
import { createPageMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { createBreadcrumbSchema } from '@/lib/structured-data';

const filterQueryKeys = ['category', 'subcategory', 'option', 'shape', 'style', 'metal', 'certificate', 'sort', 'page'] as const

function hasFilterQuery(params: Record<string, string | string[] | undefined>) {
  return filterQueryKeys.some((key) => typeof params[key] === 'string' && Boolean(params[key]))
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const metadata = createPageMetadata({
    title: 'Shop',
    description: 'Browse our collection of fine jewellery and hip hop jewellery with natural and CVD diamonds.',
    path: '/shop',
  })

  if (!hasFilterQuery(params)) return metadata

  return {
    ...metadata,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  noStore()
  const params = await searchParams
  const products = await getStorefrontProducts('standard')
  const filteredProducts = filterStorefrontProducts(products, {
    productLane: 'standard',
    subcategorySlug: typeof params.subcategory === 'string' ? params.subcategory : null,
    optionSlug: typeof params.option === 'string' ? params.option : null,
    shapeSlug: typeof params.shape === 'string' ? params.shape : null,
    styleSlug: typeof params.style === 'string' ? params.style : null,
    metalSlug: typeof params.metal === 'string' ? params.metal : null,
    certificate: typeof params.certificate === 'string' ? params.certificate : null,
  })

  return (
    <>
      <JsonLd data={createBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }])} />
      <ShopClient
        products={filteredProducts.map(toStorefrontProductCard)}
        sourceProducts={products.filter((product) => product.productLane === 'standard').map(toStorefrontProductCard)}
        heroTitle="Our Collection"
        heroSubtitle="Browse our curated selection of fine jewellery, engagement rings, and wedding bands."
        initialFilters={{
          ...(typeof params.category === 'string' ? { category: [params.category] } : {}),
          ...(typeof params.shape === 'string' ? { shape: [params.shape] } : {}),
          ...(typeof params.style === 'string' ? { style: [params.style] } : {}),
          ...(typeof params.metal === 'string' ? { metal: [params.metal] } : {}),
          ...(typeof params.certificate === 'string' ? { certificate: [params.certificate] } : {}),
        }}
      />
    </>
  );
}
