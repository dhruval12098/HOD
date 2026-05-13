// components/product/ProductGallery.tsx - House of Diams
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import type { GemStyle } from '@/lib/data/products';
import GemSVG from '@/components/common/GemSVG';

interface ProductGalleryProps {
  gemStyle: GemStyle;
  gemColor: string;
  dark?: boolean;
  imageUrl?: string;
  galleryUrls?: string[];
  videoUrl?: string;
}

type MediaAsset = { type: 'image' | 'video'; url: string };
type ThumbnailSlot = MediaAsset | { type: 'placeholder'; key: string };

export default function ProductGallery({
  gemStyle,
  gemColor,
  dark = false,
  imageUrl,
  galleryUrls = [],
  videoUrl,
}: ProductGalleryProps) {
  const assets = useMemo<MediaAsset[]>(() => {
    const maxThumbs = 5;
    const imageSlots = videoUrl ? maxThumbs - 1 : maxThumbs;
    const imageAssets = [imageUrl, ...galleryUrls]
      .filter((url): url is string => typeof url === 'string' && url.length > 0)
      .slice(0, imageSlots)
      .map((url) => ({ type: 'image' as const, url }));

    if (!videoUrl) return imageAssets;

    return [...imageAssets, { type: 'video', url: videoUrl }];
  }, [imageUrl, galleryUrls, videoUrl]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeAsset = assets[activeIndex] ?? null;
  const thumbnailSlots = useMemo<ThumbnailSlot[]>(() => {
    const minSlots = 5;
    const placeholdersNeeded = Math.max(0, minSlots - assets.length);
    return [
      ...assets,
      ...Array.from({ length: placeholdersNeeded }, (_, index) => ({
        type: 'placeholder' as const,
        key: `placeholder-${index}`,
      })),
    ];
  }, [assets]);

  useEffect(() => {
    if (assets.length === 0) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => (current >= assets.length ? 0 : current));
  }, [assets]);

  const bgMain = dark
    ? 'bg-gradient-to-br from-[#0A1628] to-[#111F34] border-[rgba(10,22,40,0.2)]'
    : 'bg-gradient-to-br from-[#FAFBFD] to-[#FAF7F2] border-[rgba(10,22,40,0.10)]';

  const bgThumb = dark
    ? 'bg-gradient-to-br from-[#0A1628] to-[#111F34]'
    : 'bg-gradient-to-br from-[#FAFBFD] to-[#FAF7F2]';
  const activeKey = activeAsset ? `${activeAsset.type}-${activeAsset.url}` : 'fallback';
  const mainMediaClass =
    'absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover object-center transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] group-hover:scale-[1.04]';
  const thumbMediaClass =
    'absolute left-1/2 top-1/2 h-full w-full min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover object-center';
  const desktopGridAssets = assets.length > 0 ? assets : [];

  return (
    <div>
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 gap-4 pr-2">
          {desktopGridAssets.map((asset, index) => (
            <div
              key={`${asset.type}-${asset.url}-${index}`}
              className={`
                ${bgMain} relative aspect-square overflow-hidden rounded-[28px] border
                shadow-[0_18px_50px_rgba(10,22,40,0.06)]
              `}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,22,40,0.1),transparent_70%)]" />
              {asset.type === 'video' ? (
                <>
                  <video
                    src={asset.url}
                    className={mainMediaClass}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(10,22,40,0.14)]">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/92 text-[#0A1628] shadow-[0_14px_28px_rgba(10,22,40,0.18)]">
                      <Play size={18} className="translate-x-[1px] fill-current" />
                    </span>
                  </div>
                </>
              ) : (
                <img
                  src={asset.url}
                  alt={`Jewellery product media ${index + 1}`}
                  className={mainMediaClass}
                  loading="lazy"
                />
              )}
            </div>
          ))}
          {desktopGridAssets.length === 0 ? (
            <div
              className={`
                ${bgMain} col-span-2 aspect-square rounded-[28px] border
                flex items-center justify-center overflow-hidden
                shadow-[0_18px_50px_rgba(10,22,40,0.06)]
              `}
            >
              <div className="flex h-full w-full items-center justify-center drop-shadow-[0_16px_40px_rgba(10,22,40,0.25)]">
                <GemSVG style={gemStyle} size={260} color={gemColor} />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="lg:hidden">
        <div
          className={`
            w-full aspect-square ${bgMain} border rounded-[28px]
            relative mb-4 overflow-hidden
            flex items-center justify-center group
            shadow-[0_18px_50px_rgba(10,22,40,0.06)]
          `}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,22,40,0.1),transparent_70%)]" />

          <div key={activeKey} className="absolute inset-0 animate-[fadeUp_0.45s_ease]">
            {activeAsset?.type === 'video' ? (
              <div className="absolute inset-0 overflow-hidden">
                <video
                  src={activeAsset.url}
                  className={mainMediaClass}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                />
              </div>
            ) : activeAsset?.type === 'image' ? (
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={activeAsset.url}
                  alt="Jewellery product media"
                  className={mainMediaClass}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] group-hover:scale-105 drop-shadow-[0_16px_40px_rgba(10,22,40,0.25)]">
                <GemSVG style={gemStyle} size={260} color={gemColor} />
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-full justify-center gap-[10px]">
            {thumbnailSlots.map((thumb, index) => {
              if (thumb.type === 'placeholder') {
                return (
                  <div
                    key={thumb.key}
                    className={`aspect-square w-[62px] flex-none rounded-[18px] border border-[rgba(10,22,40,0.08)] ${bgThumb} opacity-35 sm:w-[72px] md:w-[82px]`}
                    aria-hidden="true"
                  />
                );
              }

              const isActive = activeIndex === index;
              return (
                <button
                  key={`${thumb.type}-${thumb.url}-${index}`}
                  onClick={() => setActiveIndex(index)}
                  className={`
                    aspect-square w-[62px] flex-none ${bgThumb} border rounded-[18px]
                    flex items-center justify-center cursor-pointer
                    overflow-hidden transition-all duration-300
                    sm:w-[72px] md:w-[82px]
                    ${isActive
                      ? 'border-[#0A1628] shadow-[0_0_0_1px_#0A1628_inset]'
                      : 'border-[rgba(10,22,40,0.10)] hover:border-[#0A1628]'
                    }
                  `}
                  aria-label={`View media ${index + 1}`}
                >
                  {thumb?.type === 'video' ? (
                    <div className="relative h-full w-full overflow-hidden">
                      <video
                        src={thumb.url}
                        className={thumbMediaClass}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-[rgba(10,22,40,0.18)]">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/92 text-[#0A1628] shadow-[0_12px_24px_rgba(10,22,40,0.16)]">
                          <Play size={14} className="translate-x-[1px] fill-current" />
                        </span>
                      </div>
                    </div>
                  ) : thumb?.type === 'image' ? (
                    <div className="relative h-full w-full overflow-hidden">
                      <img src={thumb.url} alt={`Product view ${index + 1}`} className={thumbMediaClass} loading="lazy" />
                    </div>
                  ) : (
                    <GemSVG style={gemStyle} size={70} color={gemColor} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
