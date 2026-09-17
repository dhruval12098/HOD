'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost, getStorageImageUrl } from '@/lib/data/blog-posts';
import BlogCardBig from './BlogCardBig';
import BlogCardSmall from './BlogCardSmall';
import GemPlaceholder from './GemPlaceholder';

interface BlogGridProps { posts: BlogPost[]; onPostClick: (id: number) => void; maxPosts?: number; basePath?: string; simplifiedCards?: boolean; compactGrid?: boolean; }

export default function BlogGrid({ posts, onPostClick, maxPosts = 5, basePath = '/blog', simplifiedCards = false, compactGrid = false }: BlogGridProps) {
  const displayPosts = maxPosts > 0 ? posts.slice(0, maxPosts) : posts;
  const [mobilePage, setMobilePage] = useState(0);
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);
  if (compactGrid) {
    return <div className="grid grid-cols-2 gap-[var(--space-1,4px)] lg:grid-cols-4">
      {displayPosts.map((post) => {
        const imageUrl = getStorageImageUrl(post.cardImagePath || post.heroImagePath);
        const href = post.slug ? `${basePath}/${post.slug}` : basePath;
        return <Link key={post.id} href={href} prefetch className="group relative block h-[clamp(220px,32vw,500px)] min-w-0 overflow-hidden bg-[var(--color-brand-primary,#000)] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-primary,#000)]">
          {imageUrl ? <Image src={imageUrl} alt={post.heroImageAlt || post.titleRaw} fill sizes="(max-width: 1023px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" /> : <div className="absolute inset-0 flex items-center justify-center" style={{ background: post.bgColor }}><GemPlaceholder size={78} variant="diamond" /></div>}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-[var(--space-3,12px)] text-center sm:p-[var(--space-4,16px)]">
            <h3 className="blog-title-font line-clamp-2 text-[clamp(1.15rem,1.65vw,1.5rem)] font-semibold leading-[1.2] tracking-[0.02em] !text-white">{post.cardTitle || post.titleRaw}</h3>
            <span className="mt-[var(--space-2,8px)] inline-block border-b border-white/80 pb-0.5 font-[family-name:var(--font-family-button)] text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors group-hover:border-white sm:text-xs">Read article</span>
          </div>
        </Link>;
      })}
    </div>;
  }
  const postGroups = Array.from({ length: Math.ceil(displayPosts.length / 5) }, (_, index) => displayPosts.slice(index * 5, index * 5 + 5));
  const activeMobilePage = Math.min(mobilePage, Math.max(0, displayPosts.length - 1));

  return <>
    <div className="hidden space-y-5 md:block lg:space-y-6">
      {postGroups.map((group, groupIndex) => {
        const [featured, ...smallCards] = group;
        const isMirrored = groupIndex % 2 === 1;
        const groupHeight = group.length <= 2 ? 'h-[500px] lg:h-[540px]' : 'h-[620px] lg:h-[650px] xl:h-[660px]';
        const smallGrid = smallCards.length === 1 ? 'grid-cols-1 grid-rows-1' : smallCards.length === 2 ? 'grid-cols-1 grid-rows-2' : 'grid-cols-2 grid-rows-2';

        return <div key={featured.id} className={`grid grid-cols-[1.1fr_1fr] items-stretch gap-5 lg:gap-6 ${groupHeight}`}>
          <div className={`min-h-0 ${isMirrored ? 'order-2' : 'order-1'} ${group.length === 1 ? 'col-span-2' : ''}`}>
            <BlogCardBig post={featured} basePath={basePath} simplifiedDetails={simplifiedCards} onClick={() => onPostClick(featured.id)} />
          </div>
          {smallCards.length ? <div className={`grid min-h-0 gap-5 lg:gap-6 ${smallGrid} ${isMirrored ? 'order-1' : 'order-2'}`}>
            {smallCards.map((post, index) => <div key={post.id} className={`h-full min-h-0 ${smallCards.length === 3 && index === 2 ? 'col-span-2' : ''}`}>
              <BlogCardSmall post={post} basePath={basePath} simplifiedDetails={simplifiedCards} onClick={() => onPostClick(post.id)} />
            </div>)}
          </div> : null}
        </div>;
      })}
    </div>

    <div className="md:hidden">
      <div ref={mobileScrollerRef} className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" onScroll={(event) => { const node = event.currentTarget; const firstCard = node.querySelector<HTMLElement>('[data-blog-mobile-card]'); if (!firstCard) return; setMobilePage(Math.max(0, Math.min(displayPosts.length - 1, Math.round(node.scrollLeft / (firstCard.offsetWidth + 16))))); }}>
        {displayPosts.map((post) => <div key={post.id} data-blog-mobile-card className="min-w-[84%] snap-center"><BlogCardSmall post={post} basePath={basePath} simplifiedDetails={simplifiedCards} onClick={() => onPostClick(post.id)} /></div>)}
      </div>
      {displayPosts.length > 1 ? <div className="mt-5 flex items-center justify-center gap-2">{displayPosts.map((_, index) => <span key={index} className={`h-2 rounded-full transition-all ${index === activeMobilePage ? 'w-8 bg-[var(--theme-ink)]' : 'w-2 bg-[var(--theme-border-strong)]'}`} />)}</div> : null}
    </div>
  </>;
}
