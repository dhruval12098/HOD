import type { Metadata } from 'next'
import BlogClient from '@/components/pages/BlogClient'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { mapBlogPostRecord, posts as fallbackPosts } from '@/lib/data/blog-posts'

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
  title: 'Blog',
  description: 'House of Diams journal.',
}

export default async function BlogPage() {
  const supabase = createSupabaseServerClient()
  const { data: blogRows } = await supabase
    .from('blog_posts')
    .select('id, slug, category, author, date_label, read_time, bg_key, bg_color, title, title_html, subtitle, body_html, hero_image_path, is_published, sort_order, blog_post_tags(tag, sort_order)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

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

  return <BlogClient blogPosts={blogPosts} />
}
