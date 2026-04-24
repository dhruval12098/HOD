import { BlogPost, getStorageImageUrl } from "@/lib/data/blog-posts";
import GemPlaceholder from "./GemPlaceholder";

interface BlogCardBigProps {
  post: BlogPost;
  onClick: () => void;
}

export default function BlogCardBig({ post, onClick }: BlogCardBigProps) {
  const imageUrl = getStorageImageUrl(post.heroImagePath);

  return (
    <div
      onClick={onClick}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[10px] border border-[var(--theme-border)] bg-[var(--theme-surface)] transition-shadow duration-[350ms] hover:shadow-[0_20px_56px_rgba(10,22,40,0.09)]"
    >
      <div
        className="relative flex min-h-[440px] flex-1 items-center justify-center overflow-hidden rounded-[10px] lg:min-h-[540px]"
        style={{ background: post.bgColor }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.titleRaw}
            className="absolute inset-0 block h-full min-h-full w-full min-w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.04]">
            <GemPlaceholder size={120} variant="diamond" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(10,22,40,0.5)]" />

        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-7 pt-6">
          <div
            className="mb-3.5 font-['Cormorant_Garamond',Georgia,serif] text-[clamp(26px,2.9vw,36px)] font-normal leading-[1.2] tracking-[0.02em] text-white"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />
          <div className="inline-flex items-center gap-1.5 border-b border-b-white/35 pb-0.5 text-[8px] font-normal uppercase tracking-[0.2em] text-white/85 transition-[gap,border-color] duration-300 group-hover:gap-3 group-hover:border-b-white/80">
            {'Read More ->'}
          </div>
        </div>
      </div>
    </div>
  );
}
