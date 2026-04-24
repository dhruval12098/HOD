import type { Metadata } from 'next';
import HomeClient from '@/components/pages/HomeClient';
import { mapBlogPostRecord, posts as fallbackPosts } from '@/lib/data/blog-posts';
import { getHomePageData } from '@/lib/home-data';

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

export const metadata: Metadata = {
  title: 'Home',
  description: 'Luxury diamond jewellery, natural and CVD diamonds, crafted in Surat, India.',
};

export default async function Home() {
  const {
    heroContent,
    blogRows,
    collectionItems,
    materialItems,
    hiphopSection,
    certificationsSection,
    certificationItems,
    couplesData,
    diamondInfoItems,
    testimonialsData,
    marqueeData,
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
      materialItems={materialItems}
      hiphopSection={hiphopSection}
      certificationsSection={certificationsSection}
      certificationItems={certificationItems}
      couplesData={couplesData}
      diamondInfoItems={diamondInfoItems}
      testimonialsData={testimonialsData}
      marqueeData={marqueeData}
      bestSellerSection={bestSellerSection}
      bestSellerProducts={bestSellerProducts}
    />
  );
}
