import Image from "next/image";
import Link from "next/link";
import { BlogPost, getStorageImageUrl } from "@/lib/data/blog-posts";
import GemPlaceholder from "./GemPlaceholder";
import { BlogCardDetails } from "./BlogCardDetails";

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
  basePath?: string;
  simplifiedDetails?: boolean;
}

export default function BlogCardSmall({ post, basePath = "/blog", simplifiedDetails = false }: BlogCardSmallProps) {
  const variant = gemVariants[post.id % gemVariants.length] ?? "diamond";
  const imageUrl = getStorageImageUrl(post.heroImagePath);
  const href = post.slug ? `${basePath}/${post.slug}` : basePath;

  return (
    <Link
      href={href}
      prefetch
      className="group relative flex h-full flex-col overflow-hidden rounded-[10px] border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-[0_1px_0_rgba(10,22,40,0.04)] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(10,22,40,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A1628] focus-visible:ring-offset-4"
    >
      <div
        className="relative flex min-h-[245px] flex-1 items-center justify-center overflow-hidden md:min-h-0"
        style={{ background: post.bgColor }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.heroImageAlt || post.titleRaw}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="absolute inset-0 block h-full min-h-full w-full min-w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.05]">
            <GemPlaceholder size={78} variant={variant} />
          </div>
        )}

      </div>
      <BlogCardDetails post={post} compact simplified={simplifiedDetails} />
    </Link>
  );
}
