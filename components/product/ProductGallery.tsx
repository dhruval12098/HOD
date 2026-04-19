// components/product/ProductGallery.tsx - House of Diams
'use client';

import { useMemo, useState } from 'react';
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

export default function ProductGallery({
  gemStyle,
  gemColor,
  dark = false,
  imageUrl,
  galleryUrls = [],
  videoUrl,
}: ProductGalleryProps) {
  const assets = useMemo<MediaAsset[]>(() => {
    const items: MediaAsset[] = [];
    if (videoUrl) items.push({ type: 'video', url: videoUrl });
    [imageUrl, ...galleryUrls].filter(Boolean).forEach((url) => {
      items.push({ type: 'image', url: url as string });
    });
    return items.slice(0, 4);
  }, [imageUrl, galleryUrls, videoUrl]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeAsset = assets[activeIndex] ?? null;

  const bgMain = dark
    ? 'bg-gradient-to-br from-[#14120D] to-[#1C1A14] border-[rgba(184,146,42,0.2)]'
    : 'bg-gradient-to-br from-[#FBF9F5] to-[#F6F2EA] border-[rgba(20,18,13,0.10)]';

  const bgThumb = dark
    ? 'bg-gradient-to-br from-[#14120D] to-[#1C1A14]'
    : 'bg-gradient-to-br from-[#FBF9F5] to-[#F6F2EA]';

  return (
    <div className="sticky top-[100px]">
      <div
        className={`
          w-full aspect-square ${bgMain} border
          relative mb-4 overflow-hidden
          flex items-center justify-center group
        `}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(184,146,42,0.1),transparent_70%)]" />

        {activeAsset?.type === 'video' ? (
          <video
            key={activeAsset.url}
            src={activeAsset.url}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : activeAsset?.type === 'image' ? (
          <img
            src={activeAsset.url}
            alt="Jewellery product media"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] group-hover:scale-105 drop-shadow-[0_16px_40px_rgba(184,146,42,0.25)]">
            <GemSVG style={gemStyle} size={260} color={gemColor} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-[10px]">
        {[0, 1, 2, 3].map((index) => {
          const thumb = assets[index];
          const isActive = activeIndex === index;
          return (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`
                aspect-square ${bgThumb} border
                flex items-center justify-center cursor-pointer
                overflow-hidden transition-all duration-300
                ${isActive
                  ? 'border-[#B8922A]'
                  : 'border-[rgba(20,18,13,0.10)] hover:border-[#B8922A]'
                }
              `}
              aria-label={`View media ${index + 1}`}
            >
              {thumb?.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center bg-[rgba(20,18,13,0.08)]">
                  <span className="font-numeric text-[10px] uppercase tracking-[0.2em] text-[#7A7060]">Video</span>
                </div>
              ) : thumb?.type === 'image' ? (
                <img src={thumb.url} alt={`Product view ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <GemSVG style={gemStyle} size={70} color={gemColor} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
