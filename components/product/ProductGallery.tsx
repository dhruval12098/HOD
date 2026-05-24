// components/product/ProductGallery.tsx - House of Diams
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { GemStyle } from '@/lib/data/products';
import GemSVG from '@/components/common/GemSVG';

interface ProductGalleryProps {
  gemStyle: GemStyle;
  gemColor: string;
  dark?: boolean;
  imageUrl?: string;
  galleryUrls?: string[];
  videoUrl?: string;
  model3dUrl?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        poster?: string;
        alt?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'auto-rotate-delay'?: string;
        'rotation-per-second'?: string;
        'interaction-prompt'?: string;
        'touch-action'?: string;
        loading?: string;
      };
    }
  }
}

type MediaAsset = { type: 'image' | 'video' | 'model'; url: string };
type ThumbnailSlot = MediaAsset | { type: 'placeholder'; key: string };

function ModelViewer({ src }: { src: string }) {
  return React.createElement('model-viewer', {
    src,
    alt: 'Interactive 3D jewellery model',
    'camera-controls': true,
    'auto-rotate': true,
    'auto-rotate-delay': '0',
    'rotation-per-second': '32deg',
    'interaction-prompt': 'none',
    'touch-action': 'pan-y',
    loading: 'lazy',
    className: 'absolute inset-0 h-full w-full',
  });
}

export default function ProductGallery({
  gemStyle,
  gemColor,
  dark = false,
  imageUrl,
  galleryUrls = [],
  videoUrl,
  model3dUrl,
}: ProductGalleryProps) {
  useEffect(() => {
    if (!model3dUrl || typeof document === 'undefined') return;
    if (document.querySelector('script[data-model-viewer-script="true"]')) return;

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
    script.dataset.modelViewerScript = 'true';
    document.head.appendChild(script);
  }, [model3dUrl]);

  const assets = useMemo<MediaAsset[]>(() => {
    const maxThumbs = 5;
    const reservedSlots = [videoUrl, model3dUrl].filter(Boolean).length;
    const imageSlots = Math.max(1, maxThumbs - reservedSlots);
    const imageAssets = [imageUrl, ...galleryUrls]
      .filter((url): url is string => typeof url === 'string' && url.length > 0)
      .slice(0, imageSlots)
      .map((url) => ({ type: 'image' as const, url }));

    const nonImageAssets: MediaAsset[] = [];
    if (videoUrl) nonImageAssets.push({ type: 'video', url: videoUrl });
    if (model3dUrl) nonImageAssets.push({ type: 'model', url: model3dUrl });

    return [...imageAssets, ...nonImageAssets];
  }, [imageUrl, galleryUrls, videoUrl, model3dUrl]);

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
    'absolute left-1/2 top-1/2 h-full w-full max-h-[88%] max-w-[88%] -translate-x-1/2 -translate-y-1/2 object-contain object-center';
  const desktopGridAssets = assets.length > 0 ? assets : [];
  const getDesktopTileRadius = (index: number) => {
    const lastIndex = desktopGridAssets.length - 1;
    const classes = [
      index === 0 ? 'rounded-tl-[28px]' : '',
      index === 1 ? 'rounded-tr-[28px]' : '',
      index === lastIndex && index % 2 === 0 ? 'rounded-bl-[28px]' : '',
      index === lastIndex ? 'rounded-br-[28px]' : '',
      index === lastIndex - 1 && lastIndex % 2 === 1 ? 'rounded-bl-[28px]' : '',
    ].filter(Boolean);

    return classes.join(' ');
  };

  return (
    <div>
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-[28px]">
          {desktopGridAssets.map((asset, index) => (
            <div
              key={`${asset.type}-${asset.url}-${index}`}
              className={`
                ${bgMain} relative aspect-square overflow-hidden border ${getDesktopTileRadius(index)}
              `}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,22,40,0.1),transparent_70%)]" />
              {asset.type === 'model' ? (
                <ModelViewer src={asset.url} />
              ) : asset.type === 'video' ? (
                <video
                  src={asset.url}
                  className={mainMediaClass}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                />
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
              `}
            >
              <div className="flex h-full w-full items-center justify-center">
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
          `}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,22,40,0.1),transparent_70%)]" />

          <div key={activeKey} className="absolute inset-0 animate-[fadeUp_0.45s_ease]">
            {activeAsset?.type === 'model' ? (
              <div className="absolute inset-0 overflow-hidden">
                <ModelViewer src={activeAsset.url} />
              </div>
            ) : activeAsset?.type === 'video' ? (
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
              <div className="flex h-full w-full items-center justify-center transition-transform duration-700 ease-[cubic-bezier(.2,.7,.3,1)] group-hover:scale-105">
                <GemSVG style={gemStyle} size={260} color={gemColor} />
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-[10px]">
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
                    overflow-hidden p-1.5 transition-all duration-300
                    sm:w-[72px] md:w-[82px]
                    ${isActive
                      ? 'border-[#0A1628] shadow-[0_0_0_1px_#0A1628_inset]'
                      : 'border-[rgba(10,22,40,0.10)] hover:border-[#0A1628]'
                    }
                  `}
                  aria-label={`View media ${index + 1}`}
                >
                  {thumb?.type === 'model' ? (
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0A1628] text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                      3D
                    </div>
                  ) : thumb?.type === 'video' ? (
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
