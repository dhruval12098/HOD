'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BlogPostBack from '@/components/blog/BlogPostBack'
import BlogPostHero from '@/components/blog/BlogPostHero'
import BlogPostMeta from '@/components/blog/BlogPostMeta'
import BlogPostBody from '@/components/blog/BlogPostBody'
import BlogPostTags from '@/components/blog/BlogPostTags'
import BlogRelatedPosts from '@/components/blog/BlogRelatedPosts'
import { posts, type BlogPost } from '@/lib/data/blog-posts'

export default function BlogClient({ blogPosts = posts }: { blogPosts?: BlogPost[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const safePosts = blogPosts.length > 0 ? blogPosts : posts

  const activeSlug = searchParams.get('slug')
  const activePostId = Number(searchParams.get('post') ?? safePosts[0]?.id ?? 0)
  const activePost = useMemo(
    () =>
      (activeSlug
        ? safePosts.find((post) => post.slug === activeSlug)
        : safePosts.find((post) => post.id === activePostId)) ?? safePosts[0],
    [activePostId, activeSlug, safePosts]
  )
  const relatedPosts = useMemo(
    () => safePosts.filter((post) => post.id !== activePost.id).slice(0, 3),
    [activePost, safePosts]
  )

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#0A1628]">
      <BlogPostBack onBack={() => router.push('/')} />
      <BlogPostHero post={activePost} />

      <section className="mx-auto max-w-[860px] px-6 py-14">
        <BlogPostMeta
          date={activePost.date}
          author={activePost.author}
          readTime={activePost.readTime}
        />
        <BlogPostBody
          title={activePost.title}
          subtitle={activePost.subtitle}
          body={activePost.body}
        />
        <BlogPostTags tags={activePost.tags} />
      </section>

      <BlogRelatedPosts
        posts={relatedPosts}
        onPostClick={(id) => {
          const target = safePosts.find((post) => post.id === id)
          router.push(target?.slug ? `/blog?slug=${target.slug}` : `/blog?post=${id}`)
        }}
      />
    </div>
  )
}
