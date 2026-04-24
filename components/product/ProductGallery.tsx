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
    ? 'bg-gradient-to-br from-[#0A1628] to-[#111F34] border-[rgba(10,22,40,0.2)]'
    : 'bg-gradient-to-br from-[#FAFBFD] to-[#FAF7F2] border-[rgba(10,22,40,0.10)]';

  const bgThumb = dark
    ? 'bg-gradient-to-br from-[#0A1628] to-[#111F34]'
    : 'bg-gradient-to-br from-[#FAFBFD] to-[#FAF7F2]';
  const activeKey = activeAsset ? `${activeAsset.type}-${activeAsset.url}` : 'fallback';

  return (
    <div className="sticky top-[100px]">
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
            <video
              src={activeAsset.url}
              className="absolute inset-0 h-full w-full scale-[1.18] object-cover object-center transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] group-hover:scale-[1.22]"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : activeAsset?.type === 'image' ? (
            <img
              src={activeAsset.url}
              alt="Jewellery product media"
              className="absolute inset-0 h-full w-full scale-[1.18] object-cover object-center transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] group-hover:scale-[1.22]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] group-hover:scale-105 drop-shadow-[0_16px_40px_rgba(10,22,40,0.25)]">
              <GemSVG style={gemStyle} size={260} color={gemColor} />
            </div>
          )}
        </div>
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
                aspect-square ${bgThumb} border rounded-[18px]
                flex items-center justify-center cursor-pointer
                overflow-hidden transition-all duration-300
                ${isActive
                  ? 'border-[#0A1628] shadow-[0_0_0_1px_#0A1628_inset]'
                  : 'border-[rgba(10,22,40,0.10)] hover:border-[#0A1628]'
                }
              `}
              aria-label={`View media ${index + 1}`}
            >
              {thumb?.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center bg-[rgba(10,22,40,0.08)]">
                  <span className="font-numeric text-[10px] uppercase tracking-[0.2em] text-[#6A6A6A]">Video</span>
                </div>
              ) : thumb?.type === 'image' ? (
                <img src={thumb.url} alt={`Product view ${index + 1}`} className="h-full w-full scale-[1.12] object-cover object-center" loading="lazy" />
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
