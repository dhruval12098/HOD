import { mapBlogPostRecord, type BlogPost } from '@/lib/data/blog-posts'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { getStorefrontProducts } from '@/lib/catalog-products'

type EducationPostRow = {
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
  hero_image_path: string
  hero_image_alt: string | null
  is_published: boolean
  sort_order: number
  education_post_tags: Array<{ tag: string; sort_order: number }> | null
  education_post_content_blocks: Array<{
    id: number
    block_type: 'text' | 'image' | 'heading' | 'quote'
    sort_order: number
    heading: string | null
    body_html: string | null
    image_path: string | null
    image_alt: string | null
    image_caption: string | null
    is_enabled: boolean
  }> | null
  education_post_products: Array<{ product_id: string; sort_order: number }> | null
}

const educationSelect =
  'id, slug, category, author, date_label, read_time, bg_key, bg_color, title, title_html, subtitle, body_html, hero_image_path, hero_image_alt, is_published, sort_order, education_post_tags(tag, sort_order), education_post_content_blocks(id, block_type, sort_order, heading, body_html, image_path, image_alt, image_caption, is_enabled), education_post_products(product_id, sort_order)'

export async function getPublishedEducationPosts(): Promise<BlogPost[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('education_posts')
    .select(educationSelect)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Unable to load Education posts:', error.message)
    return []
  }

  const rows = (data ?? []) as unknown as EducationPostRow[]
  if (!rows.length) return []

  const products = await getStorefrontProducts()
  const productMap = new Map(products.map((product) => [product.dbId, product]))

  return rows.map((row) => {
    const post = mapBlogPostRecord({
      ...row,
      hero_image_alt: row.hero_image_alt ?? undefined,
      content_blocks: (row.education_post_content_blocks ?? [])
        .filter((block) => block.is_enabled !== false)
        .sort((a, b) => a.sort_order - b.sort_order),
      tags: (row.education_post_tags ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((tag) => tag.tag),
    })
    const featuredProducts = (row.education_post_products ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((entry) => productMap.get(entry.product_id))
      .filter((product): product is NonNullable<typeof product> => Boolean(product))
    return { ...post, featuredProducts }
  })
}

export async function getPublishedEducationPostBySlug(slug: string) {
  const posts = await getPublishedEducationPosts()
  return posts.find((post) => post.slug === slug) ?? null
}
