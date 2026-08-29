import type { Metadata } from 'next';
import HomeClient from '@/components/pages/HomeClient';
import { mapBlogPostRecord, posts as fallbackPosts } from '@/lib/data/blog-posts';
import { getHomePageData, getHomeSeoData } from '@/lib/home-data';
import { createPageMetadata } from '@/lib/seo';

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
  const {
    heroContent,
    blogRows,
    collectionItems,
    discoverShapesItems,
    discoverRingsItems,
    hiphopSection,
    collectionPageConfig,
    bespokeShowcaseSection,
    couplesData,
    diamondInfoItems,
    diamondInfoConfig,
    testimonialsData,
    marqueeData,
    trustedPartnersData,
    bestSellerSection,
    bestSellerProducts,
  } = await getHomePageData();

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
      heroContent={heroContent}
      blogPosts={blogPosts}
      collectionItems={collectionItems}
      discoverShapesItems={discoverShapesItems}
      discoverRingsItems={discoverRingsItems}
      hiphopSection={hiphopSection}
      collectionPageConfig={collectionPageConfig}
      bespokeShowcaseSection={bespokeShowcaseSection}
      couplesData={couplesData}
      diamondInfoItems={diamondInfoItems}
      diamondInfoConfig={diamondInfoConfig}
      testimonialsData={testimonialsData}
      marqueeData={marqueeData}
      trustedPartnersData={trustedPartnersData}
      bestSellerSection={bestSellerSection}
      bestSellerProducts={bestSellerProducts}
    />
  );
}
