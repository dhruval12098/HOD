import type { Metadata } from 'next'
import DocsPage from '@/components/docs/DocsPage'
import { createPageMetadata } from '@/lib/seo'
import { getDocsPageContent } from '@/lib/docs-pages'

export const metadata: Metadata = createPageMetadata({
  title: 'Shipping',
  description: 'Shipping timelines and delivery details from House of Diams.',
  path: '/shipping',
})

export default async function ShippingPage() {
  const { page, blocks } = await getDocsPageContent('shipping')

  return (
    <DocsPage
      eyebrow={page?.eyebrow ?? 'Support'}
      title={page?.title ?? 'Shipping'}
      subtitle={page?.subtitle ?? 'Shipping timelines and delivery details.'}
      blocks={blocks.length ? blocks : [{ heading: 'Shipping', description: 'Shipping timelines and delivery details.', body: 'We aim to dispatch orders quickly and keep you informed throughout the process.' }]}
    />
  )
}
