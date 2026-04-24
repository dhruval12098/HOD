import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import DocsPage from '@/components/docs/DocsPage'

export const metadata: Metadata = {
  title: 'Returns',
  description: 'Returns and exchange information from House of Diams.',
}

export default async function ReturnsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let page = null
  let blocks: Array<{ heading: string; description: string; body: string }> = []

  if (supabaseUrl && supabaseServiceRoleKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const { data: pageData } = await supabase.from('docs_pages').select('id, eyebrow, title, subtitle').eq('slug', 'returns').maybeSingle()
    page = pageData ?? null
    if (pageData?.id) {
      const { data: blockData } = await supabase.from('docs_blocks').select('heading, description, body').eq('page_id', pageData.id).order('sort_order', { ascending: true })
      blocks = blockData ?? []
    }
  }

  return (
    <DocsPage
      eyebrow={page?.eyebrow ?? 'Support'}
      title={page?.title ?? 'Returns'}
      subtitle={page?.subtitle ?? 'Returns and exchange information.'}
      blocks={blocks.length ? blocks : [{ heading: 'Returns', description: 'Returns, exchanges, and claim information.', body: 'If something needs attention, contact us and we will guide you through the next steps.' }]}
    />
  )
}
