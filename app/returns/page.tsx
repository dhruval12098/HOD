import type { Metadata } from 'next'
import DocsPage from '@/components/docs/DocsPage'
import { createPageMetadata } from '@/lib/seo'
import { getDocsPageContent } from '@/lib/docs-pages'

export const metadata: Metadata = createPageMetadata({
  title: 'Returns',
  description: 'Returns and exchange information from House of Diams.',
  path: '/returns',
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ReturnsPage() {
  const { page, blocks } = await getDocsPageContent('returns')

  return (
    <DocsPage
      eyebrow={page?.eyebrow ?? 'Support'}
      title={page?.title ?? 'Returns'}
      subtitle={page?.subtitle ?? 'Returns and exchange information.'}
      blocks={blocks.length ? blocks : [{ heading: 'Returns', description: 'Returns, exchanges, and claim information.', body: 'If something needs attention, contact us and we will guide you through the next steps.' }]}
    />
  )
}
