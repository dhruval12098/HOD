import { BlogPost, getStorageImageUrl } from "@/lib/data/blog-posts";
import GemPlaceholder from "./GemPlaceholder";

interface BlogPostHeroProps {
  post: BlogPost;
}

export default function BlogPostHero({ post }: BlogPostHeroProps) {
  const imageUrl = getStorageImageUrl(post.heroImagePath)

  return (
    <div className="max-w-[1400px] mx-auto mt-8 px-[52px] max-md:px-6">
      <div
        className="w-full overflow-hidden flex items-center justify-center relative"
        style={{
          aspectRatio: "21/9",
          background: post.bgColor,
        }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={post.titleRaw} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <GemPlaceholder size={100} variant="diamond" />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute bottom-5 left-6 text-[7.5px] tracking-[0.2em] uppercase font-medium bg-[#0A1628] text-white px-3.5 py-[5px]">
          {post.category}
        </div>
      </div>
    </div>
  );
}
