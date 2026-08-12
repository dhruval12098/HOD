'use client'

import { useRouter } from 'next/navigation'
import BlogGrid from '@/components/blog/BlogGrid'
import type { BlogPost } from '@/lib/data/blog-posts'

export default function EducationClient({ posts }: { posts: BlogPost[] }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#0A1628]">
      <section className="mx-auto max-w-[1400px] px-5 pb-20 pt-10 sm:px-7 lg:px-[52px] lg:pb-28 lg:pt-16">
        <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[720px]">
            <h1 className="font-serif text-[clamp(42px,7vw,84px)] font-normal leading-[0.95] tracking-[0.02em] text-[#0A1628]">
              Education
            </h1>
            <p className="mt-6 max-w-[560px] text-[14px] font-light leading-[1.9] tracking-[0.03em] text-[#536070]">
              Clear, considered guidance on diamonds, jewellery, craftsmanship, care, and confident buying decisions.
            </p>
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#6A6A6A]">
            {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
          </div>
        </div>

        {posts.length ? (
          <BlogGrid
            posts={posts}
            maxPosts={0}
            basePath="/education"
            onPostClick={(id) => {
              const target = posts.find((post) => post.id === id)
              router.push(target?.slug ? `/education/${target.slug}` : '/education')
            }}
          />
        ) : (
          <div className="rounded-xl border border-[rgba(10,22,40,0.12)] bg-white px-6 py-16 text-center font-[var(--font-manrope)] text-[15px] text-[#536070]">
            Educational articles will appear here when they are published.
          </div>
        )}
      </section>
    </div>
  )
}
