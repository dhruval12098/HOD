import { mapBlogPostRecord, getStorageImageUrl, type BlogPost } from '@/lib/data/blog-posts'
import type { BlogPageHero } from '@/lib/blog'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { getStorefrontProductsByIds } from '@/lib/catalog-products'

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
  card_title?: string | null
  card_image_path?: string | null
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
  'id, slug, category, author, date_label, read_time, bg_key, bg_color, title, title_html, card_title, subtitle, body_html, hero_image_path, card_image_path, hero_image_alt, is_published, sort_order, education_post_tags(tag, sort_order), education_post_content_blocks(id, block_type, sort_order, heading, body_html, image_path, image_alt, image_caption, is_enabled), education_post_products(product_id, sort_order)'

export async function getPublishedEducationPosts(): Promise<BlogPost[]> {
  const supabase = createSupabaseServerClient()
  let result: { data: unknown; error: { code?: string; message: string } | null } = await supabase
    .from('education_posts')
    .select(educationSelect)
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (result.error && (result.error.code === '42703' || result.error.code === 'PGRST204')) {
    result = await supabase
      .from('education_posts')
      .select(educationSelect.replace(', card_title', '').replace(', card_image_path', ''))
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
  }
  if (result.error) {
    console.error('Unable to load Education posts:', result.error.message)
    return []
  }

  const rows = (result.data ?? []) as unknown as EducationPostRow[]
  if (!rows.length) return []

  const products = await getStorefrontProductsByIds(
    rows.flatMap((row) => (row.education_post_products ?? []).map((entry) => entry.product_id))
  )
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

export async function getEducationPageHero(): Promise<BlogPageHero | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('education_page_hero')
    .select('is_enabled, heading, paragraph, button_label, button_link, desktop_image_path, desktop_image_alt, mobile_image_path, mobile_image_alt')
    .eq('id', 1)
    .maybeSingle()
  if (error || !data || data.is_enabled === false) return null
  return {
    isEnabled: true,
    heading: data.heading ?? 'Education',
    paragraph: data.paragraph ?? '',
    buttonLabel: data.button_label ?? '',
    buttonLink: data.button_link ?? '',
    desktopImageUrl: getStorageImageUrl(data.desktop_image_path ?? ''),
    desktopImageAlt: data.desktop_image_alt ?? data.heading ?? 'Education',
    mobileImageUrl: getStorageImageUrl(data.mobile_image_path ?? data.desktop_image_path ?? ''),
    mobileImageAlt: data.mobile_image_alt ?? data.desktop_image_alt ?? data.heading ?? 'Education',
  }
}
