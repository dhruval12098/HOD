import Image from "next/image";
import Link from "next/link";
import { BlogPost, getStorageImageUrl } from "@/lib/data/blog-posts";
import GemPlaceholder from "./GemPlaceholder";
import { BlogCardDetails } from "./BlogCardDetails";

interface BlogCardBigProps {
  post: BlogPost;
  onClick: () => void;
  basePath?: string;
}

export default function BlogCardBig({ post, onClick, basePath = "/blog" }: BlogCardBigProps) {
  const imageUrl = getStorageImageUrl(post.heroImagePath);
  const href = post.slug ? `${basePath}/${post.slug}` : basePath;

  return (
    <Link
      href={href}
      onNavigate={(event) => { event.preventDefault(); onClick(); }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[10px] border border-[var(--theme-border)] bg-[var(--theme-surface)] shadow-[0_1px_0_rgba(10,22,40,0.04)] transition-[box-shadow,transform] duration-[350ms] hover:-translate-y-0.5 hover:shadow-[0_20px_56px_rgba(10,22,40,0.09)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A1628] focus-visible:ring-offset-4"
    >
      <div
        className="relative flex min-h-[360px] items-center justify-center overflow-hidden sm:min-h-[440px] lg:min-h-[500px]"
        style={{ background: post.bgColor }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.heroImageAlt || post.titleRaw}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="absolute inset-0 block h-full min-h-full w-full min-w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.04]">
            <GemPlaceholder size={120} variant="diamond" />
          </div>
        )}

      </div>
      <BlogCardDetails post={post} />
    </Link>
  );
}
