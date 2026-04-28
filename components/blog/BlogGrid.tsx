 'use client';

import { useEffect, useState } from "react";
import { BlogPost } from "@/lib/data/blog-posts";
import BlogCardBig from "./BlogCardBig";
import BlogCardSmall from "./BlogCardSmall";

interface BlogGridProps {
  posts: BlogPost[];
  onPostClick: (id: number) => void;
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      {direction === "left" ? (
        <path d="M15 6L9 12L15 18" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 6L15 12L9 18" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function BlogGrid({ posts, onPostClick }: BlogGridProps) {
  const [featured, ...rest] = posts;
  const smallCards = rest.slice(0, 4);
  const mobileCards = [featured, ...smallCards].filter(Boolean) as BlogPost[];
  const [page, setPage] = useState(0);

  useEffect(() => {
    const maxPage = Math.max(0, mobileCards.length - 1);
    setPage((current) => Math.min(current, maxPage));
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
        <div className="overflow-hidden">
          <div
            className="flex gap-0 transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {mobileCards.map((post, index) => (
              <div key={post.id} className="min-w-full">
                {index === 0 ? (
                  <BlogCardBig post={post} onClick={() => onPostClick(post.id)} />
                ) : (
                  <BlogCardSmall post={post} onClick={() => onPostClick(post.id)} />
                )}
              </div>
            ))}
          </div>
        </div>

        {mobileCards.length > 1 ? (
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0}
              aria-label="Previous blog posts"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border-strong)] bg-white text-[var(--theme-ink)] disabled:opacity-35"
            >
              <Chevron direction="left" />
            </button>
            <div className="flex items-center gap-2">
              {mobileCards.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index)}
                  aria-label={`Go to blog slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${index === page ? 'w-8 bg-[var(--theme-ink)]' : 'w-2 bg-[var(--theme-border-strong)]'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(mobileCards.length - 1, current + 1))}
              disabled={page >= mobileCards.length - 1}
              aria-label="Next blog posts"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--theme-border-strong)] bg-white text-[var(--theme-ink)] disabled:opacity-35"
            >
              <Chevron direction="right" />
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
