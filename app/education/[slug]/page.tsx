import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EducationPostPage from '@/components/pages/EducationPostPage'
import { getPublishedEducationPostBySlug, getPublishedEducationPosts } from '@/lib/education'
import { createPageMetadata } from '@/lib/seo'
import { getStorageImageUrl } from '@/lib/data/blog-posts'
import JsonLd from '@/components/seo/JsonLd'
import { createBlogPostingSchema } from '@/lib/structured-data'

type EducationRouteProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: EducationRouteProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedEducationPostBySlug(slug)
  if (!post) {
    return createPageMetadata({ title: 'Education Article Not Found', description: 'This educational article could not be found.', path: '/education', type: 'article' })
  }
  return createPageMetadata({
    title: post.titleRaw,
    description: post.subtitle,
    path: `/education/${post.slug}`,
    image: getStorageImageUrl(post.heroImagePath),
    type: 'article',
  })
}

export default async function EducationPostRoute({ params }: EducationRouteProps) {
  const { slug } = await params
  const posts = await getPublishedEducationPosts()
  const post = posts.find((entry) => entry.slug === slug)
  if (!post) notFound()
  const relatedPosts = posts.filter((entry) => entry.id !== post.id).slice(0, 3)
  return (
    <>
      <JsonLd data={createBlogPostingSchema(post, getStorageImageUrl(post.heroImagePath))} />
      <EducationPostPage post={post} relatedPosts={relatedPosts} />
    </>
  )
}
