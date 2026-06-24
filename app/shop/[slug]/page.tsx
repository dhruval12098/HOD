import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductClient from '@/components/pages/ProductClient';
import { getStorefrontProductBySlug, getStorefrontProducts } from '@/lib/catalog-products';
import { createPageMetadata } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { createBreadcrumbSchema, createProductSchema } from '@/lib/structured-data';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
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
    title: product.name,
    description: `${product.shortMeta} - House of Diams`,
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

  const relatedProducts = (await getStorefrontProducts())
    .filter((item) => item.slug !== slug && item.mainCategorySlug === product.mainCategorySlug && item.productLane === product.productLane)
    .slice(0, 4);

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
      <ProductClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
