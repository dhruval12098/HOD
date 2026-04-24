import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import DocsPage from '@/components/docs/DocsPage'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for House of Diams.',
}

export default async function TermsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let page = null
  let blocks: Array<{ heading: string; description: string; body: string }> = []

  if (supabaseUrl && supabaseServiceRoleKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const { data: pageData } = await supabase.from('docs_pages').select('id, eyebrow, title, subtitle').eq('slug', 'terms').maybeSingle()
    page = pageData ?? null
    if (pageData?.id) {
      const { data: blockData } = await supabase.from('docs_blocks').select('heading, description, body').eq('page_id', pageData.id).order('sort_order', { ascending: true })
      blocks = blockData ?? []
    }
  }

  return (
    <DocsPage
      eyebrow={page?.eyebrow ?? 'Legal'}
      title={page?.title ?? 'Terms & Conditions'}
      subtitle={page?.subtitle ?? 'Terms of use and purchase conditions.'}
      blocks={blocks.length ? blocks : [{ heading: 'Terms & Conditions', description: 'Website and purchase terms.', body: 'By using our website or placing an order, you agree to our terms, pricing, and service conditions.' }]}
    />
  )
}
