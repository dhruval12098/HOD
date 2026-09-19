'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { BlogPageHero as BlogPageHeroData } from '@/lib/blog'
import { getStorageImageUrl, posts, type BlogPost } from '@/lib/data/blog-posts'
import { BlogPageHero } from '@/components/blog/BlogPageHero'

function BlogCard({ post }: { post: BlogPost }) {
  const imageUrl = getStorageImageUrl(post.cardImagePath || post.heroImagePath)
  return (
    <article className="min-w-0 bg-white">
      <Link href={post.slug ? `/blog/${post.slug}` : '/blog'} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-4">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f1ef]">
          {imageUrl ? <Image src={imageUrl} alt={post.heroImageAlt || post.titleRaw} fill sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 30vw" className="object-cover" /> : null}
        </div>
        <div className="pt-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-secondary text-[10px] font-semibold uppercase text-[#6a6a6a]">
            <span>{post.catalogCategory?.name || post.category}</span>
            {post.date ? <><span aria-hidden="true">·</span><time>{post.date}</time></> : null}
          </div>
          <h2 className="mt-2 font-secondary text-[15px] font-semibold leading-[1.35] text-[#111] sm:text-[16px]">{post.cardTitle || post.titleRaw}</h2>
          {post.subtitle ? <p className="mt-2 line-clamp-2 font-secondary text-[12px] leading-5 text-[#666]">{post.subtitle}</p> : null}
          <span className="mt-3 inline-flex border-b border-[#111] pb-0.5 font-secondary text-[10px] font-semibold uppercase text-[#111]">Read article</span>
        </div>
      </Link>
    </article>
  )
}

export default function BlogClient({ blogPosts = posts, hero }: { blogPosts?: BlogPost[]; hero?: BlogPageHeroData | null }) {
  const safePosts = blogPosts.length ? blogPosts : posts
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('featured')
  const categories = useMemo(() => Array.from(new Map(safePosts.filter((post) => post.catalogCategory).map((post) => [post.catalogCategory!.slug, post.catalogCategory!])).values()), [safePosts])
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

        <section className="mt-14 sm:mt-16" aria-label="Blog articles">
          <div className="flex flex-col gap-3 border-y border-[#d8d8d8] py-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block sm:min-w-[230px]">
              <span className="sr-only">Filter by category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full appearance-none border border-[#d7d7d7] bg-white px-4 pr-10 font-secondary text-[11px] font-semibold uppercase outline-none focus:border-[#111]">
                <option value="all">Filter by Category: All</option>
                {categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
              </select>
              <ChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
            </label>
            <label className="relative block sm:min-w-[190px]">
              <span className="sr-only">Sort articles</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 w-full appearance-none border border-[#d7d7d7] bg-white px-4 pr-10 font-secondary text-[11px] font-semibold uppercase outline-none focus:border-[#111]">
                <option value="featured">Sort by: Featured</option>
                <option value="newest">Sort by: Newest</option>
                <option value="title">Sort by: Title A-Z</option>
              </select>
              <ChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
            </label>
          </div>

          {visiblePosts.length ? (
            <div className="mt-7 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-14">
              {visiblePosts.map((post) => <BlogCard key={post.id} post={post} />)}
            </div>
          ) : <p className="py-20 text-center font-secondary text-sm text-[#666]">No articles are available in this category yet.</p>}
        </section>
      </div>
    </main>
  )
}
