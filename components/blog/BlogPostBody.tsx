"use client";

interface BlogPostBodyProps {
  title: string;
  subtitle: string;
  body: string;
}

export default function BlogPostBody({ title, subtitle, body }: BlogPostBodyProps) {
  return (
    <>
      <h1
        className="font-['Cormorant_Garamond',Georgia,serif] text-[clamp(36px,5vw,54px)] font-light leading-[1.1] tracking-[0.01em] text-[#0A0A0A] mb-3 [&_em]:italic [&_em]:text-[#0A1628]"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="font-['Cormorant_Garamond',Georgia,serif] text-[19px] font-light text-[#6A6A6A] leading-[1.6] mb-10 italic">
        {subtitle}
      </p>

      {/* Rich body — scoped Tailwind via [&_*] selectors */}
      <div
        className="
          [&_p]:text-[15px] [&_p]:tracking-[0.03em] [&_p]:leading-[1.95] [&_p]:text-[#3A3A3A] [&_p]:mb-6 [&_p]:font-light
          [&_h3]:font-['Cormorant_Garamond',Georgia,serif] [&_h3]:text-[28px] [&_h3]:font-normal [&_h3]:tracking-[0.02em] [&_h3]:text-[#0A0A0A] [&_h3]:mt-11 [&_h3]:mb-4 [&_h3]:leading-[1.2]
          [&_h3_em]:italic [&_h3_em]:text-[#0A1628]
          [&_blockquote]:border-l-2 [&_blockquote]:border-[#0A1628] [&_blockquote]:px-7 [&_blockquote]:py-5 [&_blockquote]:my-9 [&_blockquote]:bg-[#FAFBFD]
          [&_blockquote_p]:font-['Cormorant_Garamond',Georgia,serif] [&_blockquote_p]:text-[20px] [&_blockquote_p]:italic [&_blockquote_p]:text-[#0A0A0A] [&_blockquote_p]:m-0 [&_blockquote_p]:leading-[1.65]
          [&_blockquote_cite]:block [&_blockquote_cite]:text-[8px] [&_blockquote_cite]:tracking-[0.18em] [&_blockquote_cite]:uppercase [&_blockquote_cite]:text-[#0A1628] [&_blockquote_cite]:mt-3 [&_blockquote_cite]:not-italic
          [&_ul]:my-4 [&_ul]:mb-6 [&_ul]:p-0 [&_ul]:list-none
          [&_ul_li]:text-[15px] [&_ul_li]:tracking-[0.03em] [&_ul_li]:leading-[1.9] [&_ul_li]:text-[#3A3A3A] [&_ul_li]:py-1.5 [&_ul_li]:pl-5 [&_ul_li]:relative
          [&_ul_li]:before:content-[''] [&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[17px] [&_ul_li]:before:w-1.5 [&_ul_li]:before:h-px [&_ul_li]:before:bg-[#0A1628]
        "
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </>
  );
}
