import type { BlogPost } from "@/lib/data/blog-posts";
import { sanitizeEmphasisTitle } from "@/lib/sanitize-html";

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

export function BlogCardDetails({
  post,
  compact = false,
  simplified = false,
}: {
  post: BlogPost;
  compact?: boolean;
  simplified?: boolean;
}) {
  if (simplified) {
    return (
      <div className={`${compact ? "p-4 lg:px-5 lg:py-4" : "p-5 sm:px-6 sm:py-5"} flex shrink-0 flex-col`}>
        <h2
          className={`${compact ? "line-clamp-2 text-[16px] leading-[1.2] lg:text-[18px]" : "line-clamp-2 text-[clamp(22px,2vw,30px)] leading-[1.2]"} blog-title-font font-semibold tracking-[-0.025em] text-[#0A1628] [&_em]:font-[inherit] [&_em]:italic`}
          dangerouslySetInnerHTML={{ __html: sanitizeEmphasisTitle(post.title) }}
        />
        <span className="mt-3 inline-flex w-fit items-center gap-2 border-b border-[#0A1628]/30 pb-1 font-[var(--font-manrope)] text-[11px] font-bold uppercase tracking-[0.14em] text-[#0A1628] transition-[gap,border-color] duration-300 group-hover:gap-3 group-hover:border-[#0A1628] lg:text-[12px]">
          Read article <span aria-hidden="true">→</span>
        </span>
      </div>
    );
  }

  return (
    <div className={compact ? "flex shrink-0 flex-col p-4 lg:p-5" : "flex shrink-0 flex-col p-6 sm:p-7"}>
      <p className={`${compact ? "mb-1.5 text-[10px] lg:mb-2 lg:text-[11px]" : "mb-3 text-[12px]"} font-[var(--font-manrope)] font-bold uppercase tracking-[0.16em] text-[#765F35]`}>
        {post.category}
      </p>
      <h2
        className={`${compact ? "line-clamp-2 text-[16px] leading-[1.2] lg:text-[18px]" : "line-clamp-3 text-[clamp(24px,2.3vw,34px)] leading-[1.25]"} blog-title-font font-semibold tracking-[-0.025em] text-[#0A1628] [&_em]:font-[inherit] [&_em]:italic`}
        dangerouslySetInnerHTML={{ __html: sanitizeEmphasisTitle(post.title) }}
      />
      <div className={compact ? "mt-2 lg:mt-3" : "mt-5"}>
        <BlogCardMeta post={post} />
      </div>
      <span className={`${compact ? "mt-3 hidden xl:inline-flex" : "mt-6 inline-flex"} w-fit items-center gap-2 border-b border-[#0A1628]/30 pb-1 font-[var(--font-manrope)] text-[12px] font-bold uppercase tracking-[0.14em] text-[#0A1628] transition-[gap,border-color] duration-300 group-hover:gap-3 group-hover:border-[#0A1628]`}>
        Read article <span aria-hidden="true">→</span>
      </span>
    </div>
  );
}
