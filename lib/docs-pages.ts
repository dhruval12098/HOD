import { createClient } from '@supabase/supabase-js'

export type DocsPageContent = {
  page: { eyebrow: string; title: string; subtitle: string } | null
  blocks: Array<{ heading: string; description: string; body: string }>
}

export async function getDocsPageContent(slug: string): Promise<DocsPageContent> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!supabaseUrl || !supabaseAnonKey) return { page: null, blocks: [] }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: page, error: pageError } = await supabase
      .from('docs_pages')
      .select('id, eyebrow, title, subtitle')
      .eq('slug', slug)
      .maybeSingle()

    if (pageError || !page) return { page: null, blocks: [] }

    const { data: blocks, error: blocksError } = await supabase
      .from('docs_blocks')
      .select('heading, description, body')
      .eq('page_id', page.id)
      .order('sort_order', { ascending: true })

    return {
      page: {
        eyebrow: page.eyebrow,
        title: page.title,
        subtitle: page.subtitle,
      },
      blocks: blocksError ? [] : blocks ?? [],
    }
  } catch (error) {
    console.error(`Unable to load Docs page "${slug}".`, error)
    return { page: null, blocks: [] }
  }
}
