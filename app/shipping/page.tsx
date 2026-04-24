import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import DocsPage from '@/components/docs/DocsPage'

export const metadata: Metadata = {
  title: 'Shipping',
  description: 'Shipping timelines and delivery details from House of Diams.',
}

export default async function ShippingPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  let page = null
  let blocks: Array<{ heading: string; description: string; body: string }> = []

  if (supabaseUrl && supabaseServiceRoleKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const { data: pageData } = await supabase.from('docs_pages').select('id, eyebrow, title, subtitle').eq('slug', 'shipping').maybeSingle()
    page = pageData ?? null
    if (pageData?.id) {
      const { data: blockData } = await supabase.from('docs_blocks').select('heading, description, body').eq('page_id', pageData.id).order('sort_order', { ascending: true })
      blocks = blockData ?? []
    }
  }

  return (
    <DocsPage
      eyebrow={page?.eyebrow ?? 'Support'}
      title={page?.title ?? 'Shipping'}
      subtitle={page?.subtitle ?? 'Shipping timelines and delivery details.'}
      blocks={blocks.length ? blocks : [{ heading: 'Shipping', description: 'Shipping timelines and delivery details.', body: 'We aim to dispatch orders quickly and keep you informed throughout the process.' }]}
    />
  )
}
