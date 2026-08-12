import { mapBlogPostRecord, posts as fallbackPosts, type BlogPost } from '@/lib/data/blog-posts'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { getStorefrontProducts } from '@/lib/catalog-products'

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
  hero_image_alt?: string | null
  is_published: boolean
  sort_order: number | null
  blog_post_tags: BlogTagRow[] | null
  blog_post_content_blocks: BlogContentBlockRow[] | null
  blog_post_products: { product_id: string; sort_order: number | null }[] | null
}

const blogPostSelect =
  'id, slug, category, author, date_label, read_time, bg_key, bg_color, title, title_html, subtitle, body_html, hero_image_path, hero_image_alt, is_published, sort_order, blog_post_tags(tag, sort_order), blog_post_content_blocks(id, block_type, sort_order, heading, body_html, image_path, image_alt, image_caption, is_enabled), blog_post_products(product_id, sort_order)'

const legacyBlogPostSelect =
  'id, slug, category, author, date_label, read_time, bg_key, bg_color, title, title_html, subtitle, body_html, hero_image_path, is_published, sort_order, blog_post_tags(tag, sort_order), blog_post_content_blocks(id, block_type, sort_order, heading, body_html, image_path, image_alt, image_caption, is_enabled), blog_post_products(product_id, sort_order)'

function isMissingHeroAltColumn(error: { code?: string; message?: string } | null) {
  if (!error) return false
  const message = String(error.message ?? '')
  return error.code === 'PGRST204' || error.code === '42703' || message.includes('blog_posts.hero_image_alt') || message.includes('hero_image_alt')
}

async function loadPublishedBlogRows() {
  const supabase = createSupabaseServerClient()
  const currentResult = await supabase
    .from('blog_posts')
    .select(blogPostSelect)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (!isMissingHeroAltColumn(currentResult.error)) return currentResult.data as BlogPostRow[] | null

  const legacyResult = await supabase
    .from('blog_posts')
    .select(legacyBlogPostSelect)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  return legacyResult.data as BlogPostRow[] | null
}

function mapRows(rows: BlogPostRow[] | null): BlogPost[] {
  return ((rows?.length ? rows : null)?.map((row) =>
    mapBlogPostRecord({
      ...row,
      hero_image_path: row.hero_image_path ?? undefined,
      hero_image_alt: row.hero_image_alt ?? undefined,
      content_blocks: (row.blog_post_content_blocks ?? [])
        .filter((block) => block.is_enabled !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
      sort_order: row.sort_order ?? undefined,
      tags: (row.blog_post_tags ?? [])
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((tag) => tag.tag),
    })
  ) ?? fallbackPosts).filter((post) => post.isPublished !== false)
}

export async function getPublishedBlogPosts() {
  const rows = await loadPublishedBlogRows()
  const mappedPosts = mapRows(rows)
  if (!rows?.length) return mappedPosts

  const storefrontProducts = await getStorefrontProducts()
  const productMap = new Map(storefrontProducts.map((product) => [product.dbId, product]))

  return mappedPosts.map((post) => {
    const sourceRow = rows.find((row) => row.id === post.id)
    const featuredProducts = (sourceRow?.blog_post_products ?? [])
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((entry) => productMap.get(entry.product_id))
      .filter((product): product is NonNullable<typeof product> => Boolean(product))

    return { ...post, featuredProducts }
  })
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const posts = await getPublishedBlogPosts()
  return posts.find((post) => post.slug === slug) ?? null
}
