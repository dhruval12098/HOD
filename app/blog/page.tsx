import type { Metadata } from 'next'
import BlogClient from '@/components/pages/BlogClient'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { mapBlogPostRecord, posts as fallbackPosts } from '@/lib/data/blog-posts'

type BlogTagRow = { tag: string; sort_order: number | null }
type BlogContentBlockRow = {
  id: number
  block_type: 'text' | 'image' | 'heading' | 'quote'
  sort_order: number | null
  heading: string | null
  body_html: string | null
  image_path: string | null
  image_alt: string | null
  image_caption: string | null
  is_enabled: boolean | null
}
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
  blog_post_content_blocks: BlogContentBlockRow[] | null
}

export const metadata: Metadata = {
  title: 'Blog',
  description: 'House of Diams journal.',
}

export default async function BlogPage() {
  const supabase = createSupabaseServerClient()
  const { data: blogRows } = await supabase
    .from('blog_posts')
    .select('id, slug, category, author, date_label, read_time, bg_key, bg_color, title, title_html, subtitle, body_html, hero_image_path, is_published, sort_order, blog_post_tags(tag, sort_order), blog_post_content_blocks(id, block_type, sort_order, heading, body_html, image_path, image_alt, image_caption, is_enabled)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  const blogPosts = ((blogRows as BlogPostRow[] | null)?.map((row) =>
    mapBlogPostRecord({
      ...row,
      hero_image_path: row.hero_image_path ?? undefined,
      content_blocks: (row.blog_post_content_blocks ?? [])
        .filter((block) => block.is_enabled !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
      sort_order: row.sort_order ?? undefined,
      tags: (row.blog_post_tags ?? [])
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((tag) => tag.tag),
    })
  ) ?? fallbackPosts)

  return <BlogClient blogPosts={blogPosts} />
}
