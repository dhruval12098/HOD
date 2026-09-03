export type DocsPageContent = {
  page: { eyebrow: string; title: string; subtitle: string } | null
  blocks: Array<{ heading: string; description: string; body: string }>
}

export async function getDocsPageContent(slug: string): Promise<DocsPageContent> {
  await connection()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!supabaseUrl || !supabaseAnonKey) return { page: null, blocks: [] }

  try {
    const headers = { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }
    const pageUrl = new URL('/rest/v1/docs_pages', supabaseUrl)
    pageUrl.searchParams.set('select', 'id,eyebrow,title,subtitle')
    pageUrl.searchParams.set('slug', `eq.${slug}`)
    pageUrl.searchParams.set('limit', '1')

    const pageResponse = await fetch(pageUrl, { headers, cache: 'no-store' })
    if (!pageResponse.ok) return { page: null, blocks: [] }
    const pages = await pageResponse.json() as Array<{ id: number; eyebrow: string; title: string; subtitle: string }>
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

    return {
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
import { connection } from 'next/server'
