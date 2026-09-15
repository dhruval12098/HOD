import type { Metadata } from 'next';
import HomeClient from '@/components/pages/HomeClient';
import { mapBlogPostRecord, posts as fallbackPosts } from '@/lib/data/blog-posts';
import { getFreshHomeHeroContent, getHomePageData, getHomeSeoData } from '@/lib/home-data';
import { createPageMetadata } from '@/lib/seo';
import { getFreshShopByCategory } from '@/lib/shop-by-category';

type BlogTagRow = { tag: string; sort_order: number | null }
type BlogPostRow = {
  id: number
  slug: string
  category: string
  author: string
  date_label: string
  read_time: string
  bg_key: string
  bg_color: string
  title: string
  title_html: string
  subtitle: string
  body_html: string
  hero_image_path: string | null
  is_published: boolean
  sort_order: number | null
  blog_post_tags: BlogTagRow[] | null
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getHomeSeoData();

  return createPageMetadata({
    title: seo.title || 'Luxury Diamond Jewellery',
    description: seo.description || 'House of Diams creates certified lab-grown diamond jewellery, including engagement rings, wedding bands, T-bar jewellery, and bespoke commissions.',
    path: '/',
  });
}

export default async function Home() {
  const freshHeroContentPromise = getFreshHomeHeroContent().catch(() => undefined);
  const shopByCategoryPromise = getFreshShopByCategory().catch(() => null);
  const {
    heroContent,
    blogRows,
    discoverShapesItems,
    hiphopSection,
    collectionPageConfig,
    bespokeShowcaseSection,
    diamondInfoItems,
    diamondInfoConfig,
    marqueeData,
    trustedPartnersData,
    bestSellerSection,
    bestSellerProducts,
  } = await getHomePageData();
  const freshHeroContent = await freshHeroContentPromise;
  const shopByCategory = await shopByCategoryPromise;

  const blogPosts = ((blogRows as BlogPostRow[] | null)?.map((row) =>
    mapBlogPostRecord({
      ...row,
      hero_image_path: row.hero_image_path ?? undefined,
      sort_order: row.sort_order ?? undefined,
      tags: (row.blog_post_tags ?? [])
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((tag) => tag.tag),
    })
  ) ?? fallbackPosts)

  return (
    <HomeClient
      heroContent={freshHeroContent ?? heroContent}
      shopByCategory={shopByCategory}
      blogPosts={blogPosts}
      discoverShapesItems={discoverShapesItems}
      hiphopSection={hiphopSection}
      collectionPageConfig={collectionPageConfig}
      bespokeShowcaseSection={bespokeShowcaseSection}
      diamondInfoItems={diamondInfoItems}
      diamondInfoConfig={diamondInfoConfig}
      marqueeData={marqueeData}
      trustedPartnersData={trustedPartnersData}
      bestSellerSection={bestSellerSection}
      bestSellerProducts={bestSellerProducts}
    />
  );
}
