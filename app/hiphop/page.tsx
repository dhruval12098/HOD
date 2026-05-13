import type { Metadata } from 'next';
import HipHopClient from '@/components/pages/HipHopClient';
import { getStorefrontProducts } from '@/lib/catalog-products';
import { getHipHopHeroData } from '@/lib/hiphop-hero';
import { createSupabaseServerClient } from '@/lib/server-supabase';

export const metadata: Metadata = {
  title: 'Hip Hop',
  description: 'Explore House of Diams hip hop jewellery, including chains, grillz, pendants, and rings.',
};

export default async function HipHopPage() {
  const supabase = createSupabaseServerClient()
  const [products, hero, hiphopCategoryResult, subcategoriesResult, optionsResult] = await Promise.all([
    getStorefrontProducts(),
    getHipHopHeroData(),
    supabase.from('catalog_categories').select('id').eq('slug', 'hiphop').maybeSingle(),
    supabase.from('catalog_subcategories').select('id, category_id, name, slug, display_order, status').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('catalog_options').select('id, subcategory_id, name, slug, display_order, status').eq('status', 'active').order('display_order', { ascending: true }),
  ])
  const hiphopProducts = products.filter((product) => product.productLane === 'hiphop')
  const hiphopCategoryId = hiphopCategoryResult.data?.id ?? null
  const hiphopSubcategories = hiphopCategoryId
    ? (subcategoriesResult.data ?? []).filter((entry) => entry.category_id === hiphopCategoryId)
    : []
  const hiphopOptions = optionsResult.data ?? []
  const browseSections = hiphopSubcategories.map((subcategory) => ({
    id: subcategory.id,
    title: subcategory.name,
    slug: subcategory.slug,
    options: hiphopOptions
      .filter((option) => option.subcategory_id === subcategory.id)
      .map((option) => ({
        id: option.id,
        label: option.name,
        slug: option.slug,
      })),
  }))

  return <HipHopClient products={hiphopProducts} hero={hero} browseSections={browseSections} />;
}
