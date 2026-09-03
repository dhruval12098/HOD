import type { Metadata } from 'next'
import DocsPage from '@/components/docs/DocsPage'
import { createPageMetadata } from '@/lib/seo'
import { getDocsPageContent } from '@/lib/docs-pages'

export const metadata: Metadata = createPageMetadata({
  title: 'Terms & Conditions',
  description: 'Terms and conditions for House of Diams.',
  path: '/terms',
})

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TermsPage() {
  const { page, blocks } = await getDocsPageContent('terms')

  return (
    <DocsPage
      eyebrow={page?.eyebrow ?? 'Legal'}
      title={page?.title ?? 'Terms & Conditions'}
      subtitle={page?.subtitle ?? 'Terms of use and purchase conditions.'}
      blocks={blocks.length ? blocks : [{ heading: 'Terms & Conditions', description: 'Website and purchase terms.', body: 'By using our website or placing an order, you agree to our terms, pricing, and service conditions.' }]}
    />
  )
}
