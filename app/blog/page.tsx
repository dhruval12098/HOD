import type { Metadata } from 'next'
import BlogClient from '@/components/pages/BlogClient'
import { createPageMetadata } from '@/lib/seo'
import { getPublishedBlogPosts } from '@/lib/blog'

export const metadata: Metadata = createPageMetadata({
  title: 'Blog',
  description: 'Read House of Diams journal articles on diamonds, jewellery craft, buying guides, and design inspiration.',
  path: '/blog',
  type: 'article',
})

export default async function BlogPage() {
  const blogPosts = await getPublishedBlogPosts()

  return <BlogClient blogPosts={blogPosts} />
}
