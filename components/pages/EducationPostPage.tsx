'use client'

import { useRouter } from 'next/navigation'
import BlogPostBack from '@/components/blog/BlogPostBack'
import BlogPostHero from '@/components/blog/BlogPostHero'
import BlogPostMeta from '@/components/blog/BlogPostMeta'
import BlogPostBody from '@/components/blog/BlogPostBody'
import BlogPostTags from '@/components/blog/BlogPostTags'
import BlogProductGrid from '@/components/blog/BlogProductGrid'
import BlogRelatedPosts from '@/components/blog/BlogRelatedPosts'
import type { BlogPost } from '@/lib/data/blog-posts'

export default function EducationPostPage({ post, relatedPosts }: { post: BlogPost; relatedPosts: BlogPost[] }) {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-[#faf7f2] font-[var(--font-manrope)] text-[#0A1628]">
      <BlogPostBack label="Back to Education" onBack={() => router.push('/education')} />
      <BlogPostHero post={post} />
      <section className="mx-auto max-w-[860px] px-6 py-14">
        <BlogPostMeta date={post.date} author={post.author} readTime={post.readTime} />
        <BlogPostBody title={post.title} subtitle={post.subtitle} body={post.body} contentBlocks={post.contentBlocks} />
        <BlogPostTags tags={post.tags} />
      </section>
      <BlogProductGrid products={post.featuredProducts ?? []} />
      <BlogRelatedPosts
        posts={relatedPosts}
        basePath="/education"
        heading="More Education"
        onPostClick={(id) => {
          const target = relatedPosts.find((entry) => entry.id === id)
          router.push(target?.slug ? `/education/${target.slug}` : '/education')
        }}
      />
    </div>
  )
}
