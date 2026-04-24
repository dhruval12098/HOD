import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import DocsPage from '@/components/docs/DocsPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for House of Diams.',
}

export default async function PrivacyPolicyPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let page = null
  let blocks: Array<{ heading: string; description: string; body: string }> = []

  if (supabaseUrl && supabaseServiceRoleKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const { data: pageData } = await supabase.from('docs_pages').select('id, eyebrow, title, subtitle').eq('slug', 'privacy-policy').maybeSingle()
    page = pageData ?? null
    if (pageData?.id) {
      const { data: blockData } = await supabase.from('docs_blocks').select('heading, description, body').eq('page_id', pageData.id).order('sort_order', { ascending: true })
      blocks = blockData ?? []
    }
  }

  return (
    <DocsPage
      eyebrow={page?.eyebrow ?? 'Legal'}
      title={page?.title ?? 'Privacy Policy'}
      subtitle={page?.subtitle ?? 'How customer data is collected and used.'}
      blocks={blocks.length ? blocks : [{ heading: 'Privacy Policy', description: 'How customer data is collected and used.', body: 'We only collect the information needed to process orders, respond to inquiries, and improve our service.' }]}
    />
  )
}
