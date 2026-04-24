import { BlogPost, getStorageImageUrl } from "@/lib/data/blog-posts";
import GemPlaceholder from "./GemPlaceholder";

const gemVariants: Array<"diamond" | "star" | "ellipse" | "organic" | "ring"> = [
  "diamond",
  "star",
  "ellipse",
  "organic",
  "ring",
];

interface BlogCardSmallProps {
  post: BlogPost;
  onClick: () => void;
}

export default function BlogCardSmall({ post, onClick }: BlogCardSmallProps) {
  const variant = gemVariants[post.id % gemVariants.length] ?? "diamond";
  const imageUrl = getStorageImageUrl(post.heroImagePath);

  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[10px] border border-[var(--theme-border)] bg-[var(--theme-surface)] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(10,22,40,0.08)]"
    >
      <div
        className="relative flex min-h-[260px] flex-1 items-center justify-center overflow-hidden rounded-[10px] lg:min-h-[280px]"
        style={{ background: post.bgColor }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={post.titleRaw}
            className="absolute inset-0 block h-full min-h-full w-full min-w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.05]">
            <GemPlaceholder size={78} variant={variant} />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(10,22,40,0.5)]" />

        <div className="absolute bottom-0 left-0 right-0 z-10 px-3.5 pb-4 pt-3.5">
          <div
            className="mb-2.5 font-['Cormorant_Garamond',Georgia,serif] text-[clamp(16px,1.8vw,21px)] font-normal leading-[1.25] tracking-[0.02em] text-white"
            dangerouslySetInnerHTML={{ __html: post.title }}
          />
          <div className="inline-flex items-center gap-1.5 border-b border-b-white/30 pb-0.5 text-[7.5px] font-normal uppercase tracking-[0.18em] text-white/80 transition-[gap,border-color] duration-[250ms] group-hover:gap-2.5 group-hover:border-b-white/75">
            {'Read More ->'}
          </div>
        </div>
      </div>
    </div>
  );
}
