'use client'

import { useRouter } from 'next/navigation'
import BlogGrid from '@/components/blog/BlogGrid'
import { posts, type BlogPost } from '@/lib/data/blog-posts'
import { veloriaFont } from '@/app/fonts'

export default function BlogClient({ blogPosts = posts }: { blogPosts?: BlogPost[] }) {
  const router = useRouter()
  const safePosts = blogPosts.length > 0 ? blogPosts : posts

  return (
    <div className="min-h-screen bg-[var(--theme-base)] text-[#0A1628]">
      <section className="mx-auto max-w-[1400px] px-5 pb-20 pt-10 sm:px-7 lg:px-[52px] lg:pb-28 lg:pt-16">
        <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[720px]">
            <h1 className={`${veloriaFont.variable} font-test-veloria text-[clamp(42px,7vw,84px)] font-normal leading-[0.95] tracking-[0.02em] text-[#0A1628]`}>
              Blogs
            </h1>
            <p className="mt-6 max-w-[560px] text-[14px] font-light leading-[1.9] tracking-[0.03em] text-[#536070]">
              Diamond education, jewellery craft, buying guides, and design notes from the House of Diams atelier.
            </p>
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#6A6A6A]">
            {safePosts.length} {safePosts.length === 1 ? 'Article' : 'Articles'}
          </div>
        </div>

        <BlogGrid
          posts={safePosts}
          maxPosts={0}
          simplifiedCards
          onPostClick={(id) => {
            const target = safePosts.find((post) => post.id === id)
            router.push(target?.slug ? `/blog/${target.slug}` : '/blog')
          }}
        />
      </section>
    </div>
  )
}
