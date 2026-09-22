"use client";

import { getStorageImageUrl, type BlogPostContentBlock } from "@/lib/data/blog-posts";
import { sanitizeEmphasisTitle, sanitizeRichText } from "@/lib/sanitize-html";
import BlogFeaturedProjects from "@/components/blog/BlogFeaturedProjects";
import type { StorefrontProduct } from "@/lib/catalog-products";

interface BlogPostBodyProps {
  title: string;
  subtitle: string;
  body: string;
  contentBlocks?: BlogPostContentBlock[];
  featuredProducts?: StorefrontProduct[];
}

export default function BlogPostBody({ title, subtitle, body, contentBlocks = [], featuredProducts = [] }: BlogPostBodyProps) {
  return (
    <>
      <h1
        className={`font-[family-name:var(--font-family-montserrat)] mb-6 w-full text-[clamp(36px,5vw,58px)] font-light leading-[1.08] tracking-[0.01em] text-black [&_em]:font-[inherit] [&_em]:italic`}
        style={{ fontWeight: 400 }}
        dangerouslySetInnerHTML={{ __html: sanitizeEmphasisTitle(title) }}
      />
      {subtitle ? (
        <aside aria-label="Article summary" className="mb-11 border-l-[3px] border-[#A7864C] bg-white px-6 py-5 shadow-[0_8px_30px_rgba(10,22,40,0.05)] sm:px-7 sm:py-6">
          <p className="mb-2 font-[family-name:var(--font-family-inter)] text-[12px] font-bold uppercase tracking-[0.16em] text-[#765F35]">Article summary</p>
          <p className="font-[family-name:var(--font-family-inter)] text-[17px] font-medium leading-[1.75] text-black sm:text-[18px]">{subtitle}</p>
        </aside>
      ) : null}

      {/* Rich body — scoped Tailwind via [&_*] selectors */}
      <div
        className={` blog-article-content
          [&_p]:font-[family-name:var(--font-family-inter)] [&_p]:text-[15.5px] [&_p]:leading-[1.95] [&_p]:text-black [&_p]:mb-6 [&_p]:font-normal
          [&_:is(h1,h2,h3,h4,h5,h6)]:font-[family-name:var(--font-family-montserrat)] [&_:is(h1,h2,h3,h4,h5,h6)]:font-normal [&_:is(h1,h2,h3,h4,h5,h6)]:tracking-[0.01em] [&_:is(h1,h2,h3,h4,h5,h6)]:text-black [&_:is(h1,h2,h3,h4,h5,h6)]:mt-11 [&_:is(h1,h2,h3,h4,h5,h6)]:mb-4 [&_:is(h1,h2,h3,h4,h5,h6)]:leading-[1.1]
          [&_h1]:text-[34px] [&_h2]:text-[27px] [&_h2]:!font-normal [&_h3]:text-[33px] [&_h3]:!font-semibold [&_h4]:text-[23px] [&_h5]:text-[20px] [&_h6]:text-[18px]
          [&_:is(h1,h2,h3,h4,h5,h6)_em]:font-[inherit] [&_:is(h1,h2,h3,h4,h5,h6)_em]:italic
          [&_blockquote]:relative [&_blockquote]:border-y [&_blockquote]:border-y-[#D8C9A9] [&_blockquote]:border-l-2 [&_blockquote]:border-l-[#A7864C] [&_blockquote]:pl-12 [&_blockquote]:pr-5 [&_blockquote]:py-8 [&_blockquote]:my-11 [&_blockquote]:bg-transparent
          [&_blockquote]:before:content-['“'] [&_blockquote]:before:absolute [&_blockquote]:before:left-4 [&_blockquote]:before:top-3 [&_blockquote]:before:font-[family-name:var(--font-family-montserrat)] [&_blockquote]:before:text-[48px] [&_blockquote]:before:leading-none [&_blockquote]:before:text-[#A7864C]
          [&_blockquote_p]:font-[family-name:var(--font-family-montserrat)] [&_blockquote_p]:text-[22px] [&_blockquote_p]:italic [&_blockquote_p]:font-normal [&_blockquote_p]:text-black [&_blockquote_p]:m-0 [&_blockquote_p]:leading-[1.55]
          [&_blockquote_cite]:block [&_blockquote_cite]:font-[family-name:var(--font-family-inter)] [&_blockquote_cite]:text-[10px] [&_blockquote_cite]:tracking-[0.18em] [&_blockquote_cite]:uppercase [&_blockquote_cite]:text-[#765F35] [&_blockquote_cite]:mt-4 [&_blockquote_cite]:not-italic
          [&_ul]:my-4 [&_ul]:mb-6 [&_ul]:p-0 [&_ul]:list-none
          [&_ul_li]:font-[family-name:var(--font-family-inter)] [&_ul_li]:text-[15.5px] [&_ul_li]:leading-[1.9] [&_ul_li]:text-black [&_ul_li]:py-1.5 [&_ul_li]:pl-5 [&_ul_li]:relative
          [&_ul_li]:before:content-[''] [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[17px] [&_ul_li]:before:w-1.5 [&_ul_li]:before:h-px [&_ul_li]:before:bg-[#0A1628]
          [&_ol]:my-4 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-7
          [&_ol_li]:font-[family-name:var(--font-family-inter)] [&_ol_li]:text-[15.5px] [&_ol_li]:leading-[1.9] [&_ol_li]:text-black [&_ol_li]:py-1.5 [&_ol_li]:pl-1.5 [&_ol_li]:marker:font-semibold [&_ol_li]:marker:text-black
        `}
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }}
      />

      {contentBlocks.length > 0 ? (
        <div className={` blog-article-content mt-10 space-y-10`}>
          {contentBlocks.map((block) => {
            if (block.type === 'image') {
              const imageUrl = getStorageImageUrl(block.imagePath)
              if (!imageUrl) return null

              return (
                <figure key={block.id} className="space-y-3">
                  <div className="relative overflow-hidden rounded-[28px] bg-[#f3f1eb]">
                    <img src={imageUrl} alt={block.imageAlt || title} className="block h-auto w-full object-cover" />
                    <BlogFeaturedProjects products={featuredProducts} />
                  </div>
                  {block.imageCaption ? (
                    <figcaption className="text-[13px] leading-[1.7] tracking-[0.02em] text-[#222222]">
                      {block.imageCaption}
                    </figcaption>
                  ) : null}
                </figure>
              )
            }

            if (block.type === 'heading' && block.heading) {
              return (
                <h3
                  key={block.id}
                  className={`font-[family-name:var(--font-family-montserrat)] text-[33px] font-semibold leading-[1.1] tracking-[0.01em] text-black [&_em]:font-[inherit] [&_em]:italic`}
                  style={{ fontWeight: 600 }}
                >
                  {block.heading}
                </h3>
              )
            }

            if ((block.type === 'text' || block.type === 'quote') && block.bodyHtml) {
              return (
                <div
                  key={block.id}
                  className={
                    block.type === 'quote'
                      ? ` relative border-y border-y-[#D8C9A9] border-l-2 border-l-[#A7864C] bg-transparent py-8 pl-12 pr-5 before:absolute before:left-4 before:top-3 before:font-[family-name:var(--font-family-montserrat)] before:text-[48px] before:leading-none before:text-[#A7864C] before:content-['“'] [&_blockquote]:m-0 [&_blockquote]:border-0 [&_blockquote]:p-0 [&_blockquote]:bg-transparent [&_p]:m-0 [&_p]:font-[family-name:var(--font-family-montserrat)] [&_p]:text-[22px] [&_p]:font-normal [&_p]:italic [&_p]:leading-[1.55] [&_p]:text-black [&_cite]:mt-4 [&_cite]:block [&_cite]:font-[family-name:var(--font-family-inter)] [&_cite]:text-[10px] [&_cite]:not-italic [&_cite]:uppercase [&_cite]:tracking-[0.18em] [&_cite]:text-[#765F35]`
                      : ` [&_p]:font-[family-name:var(--font-family-inter)] [&_p]:text-[15.5px] [&_p]:leading-[1.95] [&_p]:text-black [&_p]:mb-6 [&_p]:font-normal [&_:is(h1,h2,h3,h4,h5,h6)]:font-[family-name:var(--font-family-montserrat)] [&_:is(h1,h2,h3,h4,h5,h6)]:font-normal [&_:is(h1,h2,h3,h4,h5,h6)]:leading-[1.1] [&_:is(h1,h2,h3,h4,h5,h6)]:tracking-[0.01em] [&_:is(h1,h2,h3,h4,h5,h6)]:text-black [&_:is(h1,h2,h3,h4,h5,h6)]:mt-11 [&_:is(h1,h2,h3,h4,h5,h6)]:mb-4 [&_h1]:text-[34px] [&_h2]:text-[27px] [&_h2]:!font-normal [&_h3]:text-[33px] [&_h3]:!font-semibold [&_h4]:text-[23px] [&_h5]:text-[20px] [&_h6]:text-[18px] [&_:is(h1,h2,h3,h4,h5,h6)_em]:font-[inherit] [&_:is(h1,h2,h3,h4,h5,h6)_em]:italic [&_ul]:my-4 [&_ul]:mb-6 [&_ul]:p-0 [&_ul]:list-none [&_ul_li]:font-[family-name:var(--font-family-inter)] [&_ul_li]:text-[15.5px] [&_ul_li]:leading-[1.9] [&_ul_li]:text-black [&_ul_li]:py-1.5 [&_ul_li]:pl-5 [&_ul_li]:relative [&_ul_li]:before:content-[''] [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[17px] [&_ul_li]:before:w-1.5 [&_ul_li]:before:h-px [&_ul_li]:before:bg-[#0A1628] [&_ol]:my-4 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-7 [&_ol_li]:font-[family-name:var(--font-family-inter)] [&_ol_li]:text-[15.5px] [&_ol_li]:leading-[1.9] [&_ol_li]:text-black [&_ol_li]:py-1.5 [&_ol_li]:pl-1.5 [&_ol_li]:marker:font-semibold [&_ol_li]:marker:text-black`
                  }
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(block.bodyHtml) }}
                />
              )
            }

            return null
          })}
        </div>
      ) : null}
    </>
  );
}
