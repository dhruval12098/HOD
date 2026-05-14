'use client';

import { useEffect, useRef, useState } from "react";
import { BlogPost } from "@/lib/data/blog-posts";
import BlogCardBig from "./BlogCardBig";
import BlogCardSmall from "./BlogCardSmall";

interface BlogGridProps {
  posts: BlogPost[];
  onPostClick: (id: number) => void;
}

export default function BlogGrid({ posts, onPostClick }: BlogGridProps) {
  const [featured, ...rest] = posts;
  const smallCards = rest.slice(0, 4);
  const mobileCards = [featured, ...smallCards].filter(Boolean) as BlogPost[];
  const [mobilePage, setMobilePage] = useState(0);
  const mobileScrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const maxPage = Math.max(0, mobileCards.length - 1);
    setMobilePage((current) => Math.min(current, maxPage));
  }, [mobileCards.length]);

  return (
    <>
      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[1.28fr_1fr] max-md:hidden">
        {featured && <BlogCardBig post={featured} onClick={() => onPostClick(featured.id)} />}

        <div className="grid h-full grid-cols-1 gap-6 sm:grid-cols-2 sm:grid-rows-2">
          {smallCards.map((post) => (
            <BlogCardSmall
              key={post.id}
              post={post}
              onClick={() => onPostClick(post.id)}
            />
          ))}
        </div>
      </div>

      <div className="md:hidden">
        <div
          ref={mobileScrollerRef}
          className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const node = event.currentTarget;
            const firstCard = node.querySelector<HTMLElement>('[data-blog-mobile-card]');
            if (!firstCard) return;
            const cardWidth = firstCard.offsetWidth + 16;
            if (!cardWidth) return;
            const nextPage = Math.round(node.scrollLeft / cardWidth);
            setMobilePage(Math.max(0, Math.min(mobileCards.length - 1, nextPage)));
          }}
        >
          <div className="contents">
            {mobileCards.map((post) => (
              <div key={post.id} data-blog-mobile-card className="min-w-[84%] snap-center">
                <BlogCardSmall post={post} onClick={() => onPostClick(post.id)} />
              </div>
            ))}
          </div>
        </div>

        {mobileCards.length > 1 ? (
          <div className="mt-5 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              {mobileCards.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 rounded-full transition-all ${index === mobilePage ? 'w-8 bg-[var(--theme-ink)]' : 'w-2 bg-[var(--theme-border-strong)]'}`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
