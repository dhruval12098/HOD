import Image from "next/image";
import Link from "next/link";
import { BlogPost, getStorageImageUrl } from "@/lib/data/blog-posts";
import GemPlaceholder from "./GemPlaceholder";
import { BlogCardDetails } from "./BlogCardDetails";
import { veloriaFont } from "@/app/fonts";

interface BlogRelatedPostsProps {
  posts: BlogPost[];
  onPostClick: (id: number) => void;
  basePath?: string;
  heading?: string;
}

export default function BlogRelatedPosts({ posts, onPostClick, basePath = "/blog", heading = "More from the Journal" }: BlogRelatedPostsProps) {
  if (!posts.length) return null;

  return (
    <section aria-labelledby="related-posts-title" className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-[52px]">
      <h2
        id="related-posts-title"
        className={`${veloriaFont.variable} font-test-veloria mb-8 text-[clamp(26px,3vw,36px)] font-normal tracking-[0.01em] text-[#0A1628]`}
        style={{ fontWeight: 400 }}
      >
        {heading}
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {posts.map((post) => {
          const imageUrl = getStorageImageUrl(post.heroImagePath);
          return (
            <Link
              key={post.id}
              href={post.slug ? `${basePath}/${post.slug}` : basePath}
              prefetch
              className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-[rgba(10,22,40,0.12)] bg-white transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(10,22,40,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A1628] focus-visible:ring-offset-4"
            >
              <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden" style={{ background: post.bgColor }}>
                {imageUrl ? (
                  <Image src={imageUrl} alt={post.heroImageAlt || post.titleRaw} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                ) : (
                  <div className="transition-transform duration-700 group-hover:scale-[1.04]">
                    <GemPlaceholder size={60} variant="diamond" />
                  </div>
                )}
              </div>
              <BlogCardDetails post={post} compact />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
