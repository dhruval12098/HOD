import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductClient from '@/components/pages/ProductClient';
import { getStorefrontProductBySlug, getStorefrontProducts } from '@/lib/catalog-products';

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

  return {
    title: product.name,
    description: `${product.shortMeta} - House of Diams`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getStorefrontProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getStorefrontProducts())
    .filter((item) => item.slug !== slug && item.mainCategorySlug === product.mainCategorySlug)
    .slice(0, 4);

  return <ProductClient product={product} relatedProducts={relatedProducts} />;
}
