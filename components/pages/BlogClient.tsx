'use client'

import { useMemo, useState } from 'react'
import { Select } from '@/components/ui/select'
import type { BlogFilterCategory, BlogPageHero as BlogPageHeroData } from '@/lib/blog'
import { posts, type BlogPost } from '@/lib/data/blog-posts'
import BlogListCard from '@/components/blog/BlogListCard'
import { BlogPageHero } from '@/components/blog/BlogPageHero'

export default function BlogClient({ blogPosts = posts, hero, categories: liveCategories = [] }: { blogPosts?: BlogPost[]; hero?: BlogPageHeroData | null; categories?: BlogFilterCategory[] }) {
  const safePosts = blogPosts.length ? blogPosts : posts
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('featured')
  const categories = useMemo(() => liveCategories.length ? liveCategories : Array.from(new Map(safePosts.filter((post) => post.catalogCategory).map((post) => [post.catalogCategory!.slug, post.catalogCategory!])).values()), [liveCategories, safePosts])
  const visiblePosts = useMemo(() => {
    const filtered = category === 'all' ? safePosts : safePosts.filter((post) => post.catalogCategory?.slug === category)
    return [...filtered].sort((a, b) => {
      if (sort === 'title') return (a.cardTitle || a.titleRaw).localeCompare(b.cardTitle || b.titleRaw)
      if (sort === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    })
  }, [category, safePosts, sort])

  return (
    <main className="min-h-screen bg-white text-[#111]">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-20 pt-6 sm:px-7 sm:pt-8 lg:px-10 lg:pb-28">
        {hero ? <BlogPageHero hero={hero} /> : <div className="border-b border-[#d9d9d9] py-14"><h1 className="font-primary-display text-[clamp(34px,5vw,58px)] font-medium">Journal</h1></div>}

        <section className="section-rhythm" aria-label="Blog articles">
          <div className="sticky top-[calc(var(--hod-announcement-current-height,35px)+38px)] z-30 flex flex-col gap-3 border-y border-[#d8d8d8] bg-white/95 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:min-w-[230px] sm:max-w-[280px]">
              <Select
                value={category}
                onValueChange={setCategory}
                options={[{ value: 'all', label: 'All Categories' }, ...categories.map((item) => ({ value: item.slug, label: item.name }))]}
                validationLabel="Filter articles by category"
                triggerLabel="Filter By"
                showItemIndicator={false}
                triggerClassName="!h-[42px] !rounded-none !border-black/15 !bg-white !px-4 !py-0 !font-[family-name:var(--font-family-montserrat)] !text-[11px] !font-semibold !uppercase !tracking-[0.08em] !text-[#0A1628] !shadow-none [&>span:last-child]:!h-auto [&>span:last-child]:!w-auto [&>span:last-child]:!rounded-none [&>span:last-child]:!border-0 [&>span:last-child]:!bg-transparent [&>span:last-child]:!text-[#0A1628]"
                contentClassName="!min-w-[238px] !rounded-none !border-black/10 !bg-white !shadow-[0_10px_26px_rgba(0,0,0,0.16)]"
                itemClassName="!rounded-none !bg-white !px-5 !py-3 !font-[family-name:var(--font-family-montserrat)] !text-[12px] !font-semibold !uppercase !tracking-[0.03em] !text-[#111] focus:!bg-[#F5F5F5] data-[state=checked]:!bg-[#F5F5F5] data-[state=checked]:!text-[#111]"
              />
            </div>
            <div className="w-full sm:min-w-[190px] sm:max-w-[230px]">
              <Select
                value={sort}
                onValueChange={setSort}
                options={[{ value: 'featured', label: 'Featured' }, { value: 'newest', label: 'Newest' }, { value: 'title', label: 'Title A-Z' }]}
                validationLabel="Sort articles"
                triggerLabel="Sort By"
                showItemIndicator={false}
                contentAlign="end"
                triggerClassName="!h-[42px] !rounded-none !border-black/15 !bg-white !px-4 !py-0 !font-[family-name:var(--font-family-montserrat)] !text-[11px] !font-semibold !uppercase !tracking-[0.08em] !text-[#0A1628] !shadow-none [&>span:last-child]:!h-auto [&>span:last-child]:!w-auto [&>span:last-child]:!rounded-none [&>span:last-child]:!border-0 [&>span:last-child]:!bg-transparent [&>span:last-child]:!text-[#0A1628]"
                contentClassName="!min-w-[238px] !rounded-none !border-black/10 !bg-white !shadow-[0_10px_26px_rgba(0,0,0,0.16)]"
                itemClassName="!rounded-none !bg-white !px-5 !py-3 !font-[family-name:var(--font-family-montserrat)] !text-[12px] !font-semibold !uppercase !tracking-[0.03em] !text-[#111] focus:!bg-[#F5F5F5] data-[state=checked]:!bg-[#F5F5F5] data-[state=checked]:!text-[#111]"
              />
            </div>
          </div>

          {visiblePosts.length ? (
            <div className="mt-[var(--space-section-block)] grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-14">
              {visiblePosts.map((post) => <BlogListCard key={post.id} post={post} />)}
            </div>
          ) : <p className="py-20 text-center font-secondary text-sm text-[#666]">No articles are available in this category yet.</p>}
        </section>
      </div>
    </main>
  )
}
