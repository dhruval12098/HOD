import type { Metadata } from 'next'
import DocsPage from '@/components/docs/DocsPage'
import { createPageMetadata } from '@/lib/seo'
import { getDocsPageContent } from '@/lib/docs-pages'

export const metadata: Metadata = createPageMetadata({
  title: 'Privacy Policy',
  description: 'Privacy policy for House of Diams.',
  path: '/privacy-policy',
})

export default async function PrivacyPolicyPage() {
  const { page, blocks } = await getDocsPageContent('privacy-policy')

  return (
    <DocsPage
      eyebrow={page?.eyebrow ?? 'Legal'}
      title={page?.title ?? 'Privacy Policy'}
      subtitle={page?.subtitle ?? 'How customer data is collected and used.'}
      blocks={blocks.length ? blocks : [{ heading: 'Privacy Policy', description: 'How customer data is collected and used.', body: 'We only collect the information needed to process orders, respond to inquiries, and improve our service.' }]}
    />
  )
}
