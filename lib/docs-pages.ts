import { connection } from 'next/server'

export type DocsPageContent = {
  page: { eyebrow: string; title: string; subtitle: string } | null
  blocks: Array<{ heading: string; description: string; body: string }>
  faqCategory?: { id: number; name: string; description: string; imageUrl: string; imageAlt: string } | null
  faqItems?: Array<{ id: number; question: string; answer: string; sort_order: number }>
}

export async function getDocsPageContent(slug: string): Promise<DocsPageContent> {
  await connection()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!supabaseUrl || !supabaseAnonKey) return { page: null, blocks: [] }

  try {
    const headers = { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }
    const pageUrl = new URL('/rest/v1/docs_pages', supabaseUrl)
    pageUrl.searchParams.set('select', 'id,eyebrow,title,subtitle,faq_category_id')
    pageUrl.searchParams.set('slug', `eq.${slug}`)
    pageUrl.searchParams.set('limit', '1')

    const pageResponse = await fetch(pageUrl, { headers, cache: 'no-store' })
    if (!pageResponse.ok) return { page: null, blocks: [] }
    const pages = await pageResponse.json() as Array<{ id: number; eyebrow: string; title: string; subtitle: string; faq_category_id: number | null }>
    const page = pages[0]
    if (!page) return { page: null, blocks: [] }

    const blocksUrl = new URL('/rest/v1/docs_blocks', supabaseUrl)
    blocksUrl.searchParams.set('select', 'heading,description,body')
    blocksUrl.searchParams.set('page_id', `eq.${page.id}`)
    blocksUrl.searchParams.set('order', 'sort_order.asc')
    const blocksResponse = await fetch(blocksUrl, { headers, cache: 'no-store' })
    const blocks = blocksResponse.ok
      ? await blocksResponse.json() as Array<{ heading: string; description: string; body: string }>
      : []

    let faqCategory: DocsPageContent['faqCategory'] = null
    let faqItems: NonNullable<DocsPageContent['faqItems']> = []
    if (slug === 'returns' && page.faq_category_id) {
      const categoryUrl = new URL('/rest/v1/support_faq_categories', supabaseUrl)
      categoryUrl.searchParams.set('select', 'id,name,description,image_path,image_alt')
      categoryUrl.searchParams.set('id', `eq.${page.faq_category_id}`)
      categoryUrl.searchParams.set('is_active', 'eq.true')
      categoryUrl.searchParams.set('limit', '1')
      const itemsUrl = new URL('/rest/v1/support_faq_items', supabaseUrl)
      itemsUrl.searchParams.set('select', 'id,question,answer,sort_order')
      itemsUrl.searchParams.set('category_id', `eq.${page.faq_category_id}`)
      itemsUrl.searchParams.set('is_active', 'eq.true')
      itemsUrl.searchParams.set('order', 'sort_order.asc')
      const [categoryResponse, itemsResponse] = await Promise.all([fetch(categoryUrl, { headers, cache: 'no-store' }), fetch(itemsUrl, { headers, cache: 'no-store' })])
      const categories = categoryResponse.ok ? await categoryResponse.json() as Array<{ id: number; name: string; description: string; image_path: string | null; image_alt: string }> : []
      const category = categories[0]
      if (category) {
        const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod'
        const imageUrl = category.image_path ? `${supabaseUrl}/storage/v1/object/public/${bucket}/${category.image_path}` : ''
        faqCategory = { id: category.id, name: category.name, description: category.description, imageUrl, imageAlt: category.image_alt || category.name }
      }
      faqItems = itemsResponse.ok ? await itemsResponse.json() as NonNullable<DocsPageContent['faqItems']> : []
    }

    return {
      faqCategory,
      faqItems,
      page: {
        eyebrow: page.eyebrow,
        title: page.title,
        subtitle: page.subtitle,
      },
      blocks,
    }
  } catch (error) {
    console.error(`Unable to load Docs page "${slug}".`, error)
    return { page: null, blocks: [] }
  }
}
