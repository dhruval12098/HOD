'use client'

import { useRouter } from 'next/navigation'
import BlogPostBack from '@/components/blog/BlogPostBack'
import BlogPostHero from '@/components/blog/BlogPostHero'
import BlogPostMeta from '@/components/blog/BlogPostMeta'
import BlogPostBody from '@/components/blog/BlogPostBody'
import BlogPostTags from '@/components/blog/BlogPostTags'
import BlogRelatedPosts from '@/components/blog/BlogRelatedPosts'
import type { BlogPost } from '@/lib/data/blog-posts'

export default function BlogPostPage({
  post,
  relatedPosts,
}: {
  post: BlogPost
  relatedPosts: BlogPost[]
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#0A1628]">
      <BlogPostBack onBack={() => router.push('/blog')} />
      <BlogPostHero post={post} />

      <section className="mx-auto max-w-[860px] px-6 py-14">
        <BlogPostMeta
          date={post.date}
          author={post.author}
          readTime={post.readTime}
        />
        <BlogPostBody
          title={post.title}
          subtitle={post.subtitle}
          body={post.body}
          contentBlocks={post.contentBlocks}
        />
        <BlogPostTags tags={post.tags} />
      </section>

      <BlogRelatedPosts
        posts={relatedPosts}
        onPostClick={(id) => {
          const target = relatedPosts.find((entry) => entry.id === id)
          router.push(target?.slug ? `/blog/${target.slug}` : `/blog`)
        }}
      />
    </div>
  )
}
