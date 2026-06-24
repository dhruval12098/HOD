import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogPostPage from '@/components/pages/BlogPostPage'
import { getPublishedBlogPostBySlug, getPublishedBlogPosts } from '@/lib/blog'
import { createPageMetadata } from '@/lib/seo'
import { getStorageImageUrl } from '@/lib/data/blog-posts'

type BlogPostRouteProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostRouteProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedBlogPostBySlug(slug)

  if (!post) {
    return createPageMetadata({
      title: 'Blog Post Not Found',
      description: 'This House of Diams journal article could not be found.',
      path: '/blog',
      type: 'article',
    })
  }

  return createPageMetadata({
    title: post.titleRaw,
    description: post.subtitle,
    path: `/blog/${post.slug}`,
    image: getStorageImageUrl(post.heroImagePath),
    type: 'article',
  })
}

export default async function BlogPostRoute({ params }: BlogPostRouteProps) {
  const { slug } = await params
  const posts = await getPublishedBlogPosts()
  const post = posts.find((entry) => entry.slug === slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = posts.filter((entry) => entry.id !== post.id).slice(0, 3)

  return <BlogPostPage post={post} relatedPosts={relatedPosts} />
}
