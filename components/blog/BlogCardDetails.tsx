import type { BlogPost } from "@/lib/data/blog-posts";

export function BlogCardMeta({ post }: { post: BlogPost }) {
  const items = [post.date, post.author, post.readTime].filter(Boolean);

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-[var(--font-manrope)] text-[12px] font-semibold leading-5 text-[#526071]">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 ? <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#A7864C]" /> : null}
          <span>{item}</span>
        </span>
      ))}
    </div>
  );
}

export function BlogCardDetails({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  return (
    <div className={compact ? "flex flex-1 flex-col p-5" : "flex flex-1 flex-col p-6 sm:p-7"}>
      <p className="mb-3 font-[var(--font-manrope)] text-[12px] font-bold uppercase tracking-[0.16em] text-[#765F35]">
        {post.category}
      </p>
      <h2
        className={`${compact ? "text-[20px]" : "text-[clamp(24px,2.3vw,34px)]"} blog-title-font line-clamp-3 font-semibold leading-[1.25] tracking-[-0.025em] text-[#0A1628] [&_em]:font-[inherit] [&_em]:italic`}
        dangerouslySetInnerHTML={{ __html: post.title }}
      />
      <div className="mt-5">
        <BlogCardMeta post={post} />
      </div>
      <span className="mt-6 inline-flex w-fit items-center gap-2 border-b border-[#0A1628]/30 pb-1 font-[var(--font-manrope)] text-[12px] font-bold uppercase tracking-[0.14em] text-[#0A1628] transition-[gap,border-color] duration-300 group-hover:gap-3 group-hover:border-[#0A1628]">
        Read article <span aria-hidden="true">→</span>
      </span>
    </div>
  );
}
