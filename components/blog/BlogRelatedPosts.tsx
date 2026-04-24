import { BlogPost, getStorageImageUrl } from "@/lib/data/blog-posts";
import GemPlaceholder from "./GemPlaceholder";

interface BlogRelatedPostsProps {
  posts: BlogPost[];
  onPostClick: (id: number) => void;
}

export default function BlogRelatedPosts({ posts, onPostClick }: BlogRelatedPostsProps) {
  return (
    <div className="max-w-[1400px] mx-auto px-[52px] pb-20 max-md:px-6">
      <div className="font-['Cormorant_Garamond',Georgia,serif] text-[30px] font-light tracking-[0.03em] text-[#0A0A0A] mb-8">
        More from <em className="italic text-[#0A1628]">The Journal</em>
      </div>

      <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => onPostClick(post.id)}
            className="border border-[rgba(10,22,40,0.09)] overflow-hidden cursor-pointer transition-transform duration-300 bg-white hover:-translate-y-0.5 group"
          >
            <div
              className="relative overflow-hidden flex items-center justify-center"
              style={{ aspectRatio: "16/10", background: post.bgColor }}
            >
              {getStorageImageUrl(post.heroImagePath) ? (
                <img
                  src={getStorageImageUrl(post.heroImagePath)}
                  alt={post.titleRaw}
                  className="absolute inset-0 block h-full w-full object-cover object-center"
                />
              ) : null}

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(10,22,40,0.45)] pointer-events-none z-10" />

              {/* Gem */}
              {!getStorageImageUrl(post.heroImagePath) ? (
                <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.05]">
                  <GemPlaceholder size={60} variant="diamond" />
                </div>
              ) : null}

              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-4 pt-3 z-20">
                <div
                  className="font-['Cormorant_Garamond',Georgia,serif] text-[15px] font-normal text-white leading-[1.3] mb-2 [&_em]:italic"
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />
                <div className="text-[7px] tracking-[0.18em] uppercase text-white/75">
                  Read More →
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
