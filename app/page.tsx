import type { Metadata } from 'next';
import HomeClient from '@/components/pages/HomeClient';
import { mapBlogPostRecord, posts as fallbackPosts } from '@/lib/data/blog-posts';
import { getHomePageData } from '@/lib/home-data';
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

export const metadata: Metadata = createPageMetadata({
  title: 'Luxury Diamond Jewellery',
  description: 'House of Diams creates natural and CVD diamond jewellery, crafted in Surat for fine, bespoke, and hip hop collections.',
  path: '/',
});

export default async function Home() {
  const {
    heroContent,
    blogRows,
    collectionItems,
    discoverShapesItems,
    discoverRingsItems,
    hiphopSection,
    collectionPageConfig,
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
