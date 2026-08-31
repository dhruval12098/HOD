'use client';

import { useRef, useState } from 'react';
import { BlogPost } from '@/lib/data/blog-posts';
import BlogCardBig from './BlogCardBig';
import BlogCardSmall from './BlogCardSmall';

interface BlogGridProps { posts: BlogPost[]; onPostClick: (id: number) => void; maxPosts?: number; basePath?: string; simplifiedCards?: boolean; }

export default function BlogGrid({ posts, onPostClick, maxPosts = 5, basePath = '/blog', simplifiedCards = false }: BlogGridProps) {
  const displayPosts = maxPosts > 0 ? posts.slice(0, maxPosts) : posts;
  const postGroups = Array.from({ length: Math.ceil(displayPosts.length / 5) }, (_, index) => displayPosts.slice(index * 5, index * 5 + 5));
  const [mobilePage, setMobilePage] = useState(0);
  const activeMobilePage = Math.min(mobilePage, Math.max(0, displayPosts.length - 1));
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);

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
