import { BlogPost } from "@/lib/data/blog-posts";
import BlogCardBig from "./BlogCardBig";
import BlogCardSmall from "./BlogCardSmall";

interface BlogGridProps {
  posts: BlogPost[];
  onPostClick: (id: number) => void;
}

export default function BlogGrid({ posts, onPostClick }: BlogGridProps) {
  const [featured, ...rest] = posts;
  const smallCards = rest.slice(0, 4);

  return (
    <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[1.28fr_1fr]">
      {featured && <BlogCardBig post={featured} onClick={() => onPostClick(featured.id)} />}

      <div className="grid h-full grid-cols-1 gap-6 sm:grid-cols-2 sm:grid-rows-2">
        {smallCards.map((post) => (
          <BlogCardSmall
            key={post.id}
            post={post}
            onClick={() => onPostClick(post.id)}
          />
        ))}
      </div>
    </div>
  );
}
