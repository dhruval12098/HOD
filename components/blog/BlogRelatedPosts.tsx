import BlogListCard from "./BlogListCard";
import type { BlogPost } from "@/lib/data/blog-posts";

interface BlogRelatedPostsProps {
  posts: BlogPost[];
  onPostClick: (id: number) => void;
  basePath?: string;
  heading?: string;
}

export default function BlogRelatedPosts({ posts, basePath = '/blog', heading = "More from the Journal" }: BlogRelatedPostsProps) {
  if (!posts.length) return null;

  return (
    <section aria-labelledby="related-posts-title" className="bg-white px-[var(--space-2)] py-[var(--space-6)] sm:px-[var(--space-3)] sm:py-[var(--space-8)] xl:py-[var(--space-10)]">
      <div className="mb-[var(--space-6)] flex items-end justify-between gap-4 px-1 sm:mb-[var(--space-8)] xl:mb-[var(--space-10)]">
        <h2 id="related-posts-title" className="section-title text-[clamp(1.35rem,2.2vw,2rem)] font-medium uppercase leading-none tracking-[0.025em] text-black">{heading}</h2>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-14">
        {posts.map((post) => <BlogListCard key={post.id} post={post} basePath={basePath} />)}
      </div>
    </section>
  );
}
