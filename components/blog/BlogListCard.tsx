import Image from 'next/image'
import Link from 'next/link'
import { getStorageImageUrl, type BlogPost } from '@/lib/data/blog-posts'

export default function BlogListCard({ post }: { post: BlogPost }) {
  const imageUrl = getStorageImageUrl(post.cardImagePath || post.heroImagePath)

  return (
    <article className="min-w-0 bg-white">
      <Link href={post.slug ? `/blog/${post.slug}` : '/blog'} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-4">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f1ef]">
          {imageUrl ? <Image src={imageUrl} alt={post.heroImageAlt || post.titleRaw} fill sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 30vw" className="object-cover" /> : null}
        </div>
        <div className="pt-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-secondary text-[10px] font-semibold uppercase text-[#6a6a6a]">
            <span>{post.catalogCategory?.name || post.category}</span>
            {post.date ? <><span aria-hidden="true">·</span><time>{post.date}</time></> : null}
          </div>
          <h2 className="mt-2 font-secondary text-[15px] font-semibold leading-[1.35] text-[#111] sm:text-[16px]">{post.cardTitle || post.titleRaw}</h2>
          {post.subtitle ? <p className="mt-2 line-clamp-2 font-secondary text-[12px] leading-5 text-[#666]">{post.subtitle}</p> : null}
          <span className="mt-3 inline-flex border-b border-[#111] pb-0.5 font-secondary text-[10px] font-semibold uppercase text-[#111]">Read article</span>
        </div>
      </Link>
    </article>
  )
}
