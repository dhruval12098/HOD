import type { Metadata } from 'next'
import BlogClient from '@/components/pages/BlogClient'
import { createPageMetadata } from '@/lib/seo'
import { getPublishedBlogPosts } from '@/lib/blog'

const legacyQueryKeys = ['post', 'slug'] as const

function hasLegacyQuery(params: Record<string, string | string[] | undefined>) {
  return legacyQueryKeys.some((key) => typeof params[key] === 'string' && Boolean(params[key]))
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const params = await searchParams
  const metadata = createPageMetadata({
    title: 'Blog',
    description: 'Read House of Diams journal articles on diamonds, jewellery craft, buying guides, and design inspiration.',
    path: '/blog',
  })

  if (!hasLegacyQuery(params)) return metadata

  return {
    ...metadata,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function BlogPage() {
  const blogPosts = await getPublishedBlogPosts()

  return <BlogClient blogPosts={blogPosts} />
}
