'use client';

import Image from 'next/image';

import { cinzelFont } from '@/app/fonts';
import BrandButton from '@/components/ui/BrandButton';
import type { HomeBespokeShowcaseSection } from '@/lib/home-data';

const VIDEO_FILE_PATTERN = /\.(?:mp4|webm|ogg|mov)(?:$|[?#])/i;

export default function BespokeShowcase({
  section,
  onEnquireClick,
}: {
  section: HomeBespokeShowcaseSection;
  onEnquireClick: () => void;
}) {
  const mediaUrl = section.imageUrl || section.mobileImageUrl || '';
  const isVideo = VIDEO_FILE_PATTERN.test(mediaUrl);
  const mobileMediaUrl = section.mobileImageUrl || mediaUrl;
  const isMobileVideo = VIDEO_FILE_PATTERN.test(mobileMediaUrl);

  const renderMedia = (src: string, video: boolean) =>
    video ? (
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={section.imageAlt || section.heading || 'House of Diams bespoke jewellery showcase'}
      >
        <source src={src} />
      </video>
    ) : (
      <Image
        src={src}
        alt={section.imageAlt || section.heading || 'House of Diams bespoke jewellery showcase'}
        fill
        sizes="100vw"
        className="h-full w-full object-cover object-center"
      />
    );

  return (
    <section className="relative flex min-h-0 items-center justify-center overflow-hidden bg-[var(--color-brand-accent,#fff)] px-0 py-0">
      <div className="relative z-[2] w-full">
        <div className="relative overflow-hidden rounded-none border-0 bg-[var(--color-brand-primary,#000)] shadow-none backdrop-blur-0">
          <div className="relative h-[360px] sm:hidden">
            {mobileMediaUrl ? renderMedia(mobileMediaUrl, isMobileVideo) : null}
          </div>
          <div className="relative hidden aspect-[5/2] sm:block">
            {mediaUrl ? renderMedia(mediaUrl, isVideo) : null}
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/36 to-transparent" aria-hidden="true" />

          <div className="absolute inset-0 z-10 flex items-center px-[var(--space-4)] sm:px-[var(--space-8)] lg:px-[var(--space-12)] xl:px-[var(--space-16)]">
            <div className="max-w-[32rem] text-[var(--color-brand-accent,#fff)]">
              <h2
                className={`${cinzelFont.variable} text-[clamp(2rem,4.3vw,3.75rem)] !font-medium leading-[1.08] tracking-[0.01em]`}
              >
                {section.heading || 'Create Something One of One'}
              </h2>

              <p className="mt-[var(--space-5)] max-w-[28rem] font-[family-name:var(--font-family-secondary)] text-sm font-normal leading-[1.7] tracking-[0.01em] text-white/90 sm:text-[15px] md:text-base">
                {section.subtitle || 'Begin a bespoke commission with House of Diams, from first sketch to final setting.'}
              </p>

              <BrandButton onClick={onEnquireClick} className="mt-[var(--space-8)]">
                {section.ctaLabel || 'Start Bespoke Enquiry'}
              </BrandButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
