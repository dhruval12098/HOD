"use client";

import { getStorageImageUrl, type BlogPostContentBlock } from "@/lib/data/blog-posts";
import { sanitizeEmphasisTitle, sanitizeRichText } from "@/lib/sanitize-html";

interface BlogPostBodyProps {
  title: string;
  subtitle: string;
  body: string;
  contentBlocks?: BlogPostContentBlock[];
}

export default function BlogPostBody({ title, subtitle, body, contentBlocks = [] }: BlogPostBodyProps) {
  return (
    <>
      <h1
        className="blog-title-font mb-6 max-w-[19ch] text-[clamp(36px,5vw,58px)] font-semibold leading-[1.12] tracking-[-0.04em] text-[#0A1628] [&_em]:font-[inherit] [&_em]:italic"
        dangerouslySetInnerHTML={{ __html: sanitizeEmphasisTitle(title) }}
      />
      {subtitle ? (
        <aside aria-label="Article summary" className="mb-11 border-l-[3px] border-[#A7864C] bg-white px-6 py-5 shadow-[0_8px_30px_rgba(10,22,40,0.05)] sm:px-7 sm:py-6">
          <p className="mb-2 font-[var(--font-manrope)] text-[12px] font-bold uppercase tracking-[0.16em] text-[#765F35]">Article summary</p>
          <p className="font-[var(--font-manrope)] text-[17px] font-medium leading-[1.75] text-[#344154] sm:text-[18px]">{subtitle}</p>
        </aside>
      ) : null}

      {/* Rich body — scoped Tailwind via [&_*] selectors */}
      <div
        className="
          [&_p]:font-[var(--font-manrope)] [&_p]:text-[15.5px] [&_p]:leading-[1.95] [&_p]:text-[#333A44] [&_p]:mb-6 [&_p]:font-normal
          [&_h3]:font-[var(--font-manrope)] [&_h3]:text-[27px] [&_h3]:font-semibold [&_h3]:text-[#0A0A0A] [&_h3]:mt-11 [&_h3]:mb-4 [&_h3]:leading-[1.28]
          [&_h3_em]:italic [&_h3_em]:text-[#0A1628]
          [&_blockquote]:border-l-2 [&_blockquote]:border-[#0A1628] [&_blockquote]:px-7 [&_blockquote]:py-5 [&_blockquote]:my-9 [&_blockquote]:bg-[#FAFBFD]
          [&_blockquote_p]:font-[var(--font-manrope)] [&_blockquote_p]:text-[18px] [&_blockquote_p]:font-medium [&_blockquote_p]:text-[#0A0A0A] [&_blockquote_p]:m-0 [&_blockquote_p]:leading-[1.75]
          [&_blockquote_cite]:block [&_blockquote_cite]:text-[8px] [&_blockquote_cite]:tracking-[0.18em] [&_blockquote_cite]:uppercase [&_blockquote_cite]:text-[#0A1628] [&_blockquote_cite]:mt-3 [&_blockquote_cite]:not-italic
          [&_ul]:my-4 [&_ul]:mb-6 [&_ul]:p-0 [&_ul]:list-none
          [&_ul_li]:font-[var(--font-manrope)] [&_ul_li]:text-[15.5px] [&_ul_li]:leading-[1.9] [&_ul_li]:text-[#333A44] [&_ul_li]:py-1.5 [&_ul_li]:pl-5 [&_ul_li]:relative
          [&_ul_li]:before:content-[''] [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[17px] [&_ul_li]:before:w-1.5 [&_ul_li]:before:h-px [&_ul_li]:before:bg-[#0A1628]
        "
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }}
      />

      {contentBlocks.length > 0 ? (
        <div className="mt-10 space-y-10">
          {contentBlocks.map((block) => {
            if (block.type === 'image') {
              const imageUrl = getStorageImageUrl(block.imagePath)
              if (!imageUrl) return null

              return (
                <figure key={block.id} className="space-y-3">
                  <div className="overflow-hidden rounded-[28px] bg-[#f3f1eb]">
                    <img src={imageUrl} alt={block.imageAlt || title} className="block h-auto w-full object-cover" />
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
                  className="font-[var(--font-manrope)] text-[27px] font-semibold text-[#0A0A0A] leading-[1.28]"
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
                      ? "[&_blockquote]:border-l-2 [&_blockquote]:border-[#0A1628] [&_blockquote]:px-7 [&_blockquote]:py-5 [&_blockquote]:my-0 [&_blockquote]:bg-[#FAFBFD] [&_blockquote_p]:font-[var(--font-manrope)] [&_blockquote_p]:text-[18px] [&_blockquote_p]:font-medium [&_blockquote_p]:text-[#0A0A0A] [&_blockquote_p]:m-0 [&_blockquote_p]:leading-[1.75]"
                      : "[&_p]:font-[var(--font-manrope)] [&_p]:text-[15.5px] [&_p]:leading-[1.95] [&_p]:text-[#333A44] [&_p]:mb-6 [&_p]:font-normal [&_ul]:my-4 [&_ul]:mb-6 [&_ul]:p-0 [&_ul]:list-none [&_ul_li]:font-[var(--font-manrope)] [&_ul_li]:text-[15.5px] [&_ul_li]:leading-[1.9] [&_ul_li]:text-[#333A44] [&_ul_li]:py-1.5 [&_ul_li]:pl-5 [&_ul_li]:relative [&_ul_li]:before:content-[''] [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[17px] [&_ul_li]:before:w-1.5 [&_ul_li]:before:h-px [&_ul_li]:before:bg-[#0A1628]"
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
