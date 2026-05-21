'use client';

import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';
import { houseOfDiamsWordmarkFont } from '@/app/fonts';

type RingItem = {
  id: string;
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  aspectClass: string;
  href?: string | null;
};

type SlotConfig = { xPercent: number; scale: number; opacity: number; zIndex: number };
const SLOTS: Record<number, SlotConfig> = {
  [-2]: { xPercent: -155, scale: 0.32, opacity: 0.4,  zIndex: 1 },
  [-1]: { xPercent: -75,  scale: 0.55, opacity: 0.75, zIndex: 3 },
  [0]:  { xPercent: 0,    scale: 1,    opacity: 1,    zIndex: 5 },
  [1]:  { xPercent: 75,   scale: 0.55, opacity: 0.75, zIndex: 3 },
  [2]:  { xPercent: 155,  scale: 0.32, opacity: 0.4,  zIndex: 1 },
};

const BASE_PX = 280;
function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {direction === 'left' ? (
        <path d="M15 6L9 12L15 18" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 6L15 12L9 18" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function getOffset(i: number, center: number, total: number): number {
  let d = i - center;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

export default function DiscoverRings({
  initialItems = [],
}: {
  initialItems?: Array<{
    sort_order: number
    title: string
    description: string
    image_path: string
    image_alt?: string | null
    href?: string | null
  }>
}) {
  const items = useMemo(
    () =>
      initialItems
        .slice()
        .sort((left, right) => left.sort_order - right.sort_order)
        .map((item, index) => ({
          id: `ring-${index + 1}`,
          name: item.title,
          description: item.description,
          imageSrc: item.image_path,
          imageAlt: item.image_alt || item.title,
          aspectClass: 'aspect-square',
          href: item.href || '/shop',
        })),
    [initialItems]
  );
  const total = items.length;
  const initialIndex = Math.min(2, Math.max(0, total - 1));
  const [current, setCurrent] = useState(initialIndex);
  const [animating, setAnimating] = useState(false);
  const [displayName, setDisplayName] = useState(items[initialIndex]?.name || '');
  const [displayDesc, setDisplayDesc] = useState(items[initialIndex]?.description || '');
  const [displayHref, setDisplayHref] = useState(items[initialIndex]?.href || '/shop');

  const itemRefs = useRef<(HTMLDivElement | null)[]>(Array(total).fill(null));
  const nameRef  = useRef<HTMLSpanElement>(null);
  const descRef  = useRef<HTMLParagraphElement>(null);

  if (!items.length) return null;

  useEffect(() => {
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const off = getOffset(i, current, total);
      const slot = SLOTS[off];
      if (slot) {
        gsap.set(el, {
          x: (BASE_PX * slot.xPercent) / 100,
          scale: slot.scale,
          opacity: slot.opacity,
          zIndex: slot.zIndex,
          display: 'flex',
        });
      } else {
        // Hidden off to the right by default
        gsap.set(el, { x: BASE_PX * 2.5, opacity: 0, scale: 0.2, zIndex: 0, display: 'flex' });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function go(dir: 1 | -1) {
    if (animating) return;
    setAnimating(true);

    const newCurrent = (current + dir + total) % total;

    // Snap entering items to correct offscreen side before animating
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const oldOff = getOffset(i, current, total);
      const newOff = getOffset(i, newCurrent, total);
      const wasVisible = SLOTS[oldOff] !== undefined;
      const willVisible = SLOTS[newOff] !== undefined;

      if (!wasVisible && willVisible) {
        // Snap to entry side: going right (dir=+1) -> enter from right, going left (dir=-1) -> enter from left
        gsap.set(el, {
          x: dir > 0 ? BASE_PX * 2.5 : -BASE_PX * 2.5,
          opacity: 0,
          scale: 0.2,
          zIndex: 0,
        });
      }

      if (wasVisible && !willVisible) {
        // Animate exit: going right -> exit left, going left -> exit right
        gsap.to(el, {
          x: dir > 0 ? -BASE_PX * 2.5 : BASE_PX * 2.5,
          opacity: 0,
          scale: 0.2,
          zIndex: 0,
          duration: 0.65,
          ease: 'power3.inOut',
        });
      }
    });

    // Animate all newly visible items into their target slots
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const newOff = getOffset(i, newCurrent, total);
      const slot = SLOTS[newOff];
      if (!slot) return;
      gsap.to(el, {
        x: (BASE_PX * slot.xPercent) / 100,
        scale: slot.scale,
        opacity: slot.opacity,
        zIndex: slot.zIndex,
        duration: 0.65,
        ease: 'power3.inOut',
      });
    });

    // Label animation
    if (nameRef.current && descRef.current) {
      gsap.to([nameRef.current, descRef.current], {
        x: dir > 0 ? -24 : 24,
        opacity: 0,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          setDisplayName(items[newCurrent].name);
          setDisplayDesc(items[newCurrent].description);
          setDisplayHref(items[newCurrent].href || '/shop');
          gsap.fromTo(
            [nameRef.current, descRef.current],
            { x: dir > 0 ? 24 : -24, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.32, ease: 'power2.out' }
          );
        },
      });
    }

    setCurrent(newCurrent);
    setTimeout(() => setAnimating(false), 700);
  }

  return (
    <section className="overflow-hidden bg-white px-5 py-10 md:px-8 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-[1440px]">

        {/* Heading */}
        <div className="mx-auto max-w-[820px] text-center">
          <h2
            className="font-display-title font-light uppercase leading-[1.08] tracking-[0.01em] text-[#0A0A0A] max-md:text-[28px]"
            style={{ fontSize: 'clamp(24px, 4.5vw, 54px)', fontWeight: 400 }}
          >
            Discover Rings
          </h2>
          <p className="mx-auto mt-3 max-w-[660px] text-[15px] font-light leading-[1.5] text-[#1B1B1B] md:text-[18px]">
            Pick the style. We&apos;ll handle the rest.
          </p>
        </div>

        {/* Carousel track */}
        <div className="relative mt-2 flex h-[220px] items-center justify-center overflow-hidden md:mt-3 md:h-[300px] lg:h-[380px]">
          {items.map((item, i) => {
            const off = getOffset(i, current, total);
            const isCenter = off === 0;
            const isClickable = off === 1 || off === -1 || off === 2 || off === -2;

            return (
              <div
                key={item.id}
                ref={(node) => { itemRefs.current[i] = node; }}
                style={{
                  position: 'absolute',
                  width: BASE_PX,
                  transformOrigin: 'center center',
                  cursor: isClickable ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => {
                  if (animating || isCenter) return;
                  if (off > 0) go(1);
                  else go(-1);
                }}
              >
                {isCenter && item.href ? (
                  <Link
                    href={item.href}
                    className={`relative block w-full transition-opacity hover:opacity-90 ${item.aspectClass}`}
                    aria-label={`Browse ${item.name}`}
                  >
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 768px) 200px, 280px"
                      className="object-contain"
                      priority={isCenter}
                    />
                  </Link>
                ) : (
                  <div className={`relative w-full ${item.aspectClass}`}>
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 768px) 200px, 280px"
                      className="object-contain"
                      priority={isCenter}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="-mt-2 flex items-center justify-center gap-6 md:-mt-3 md:gap-14">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={animating}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#0A1628]/14 text-[#0A1628] transition-colors hover:bg-[#0A1628] hover:text-white disabled:opacity-60 md:h-14 md:w-14"
            aria-label="Previous ring"
          >
            <Chevron direction="left" />
          </button>

          <div className="min-w-[220px] text-center md:min-w-[360px]">
            <div className="overflow-hidden">
              {displayHref ? (
                <Link href={displayHref} className="inline-flex items-center justify-center transition-opacity hover:opacity-75">
                  <span
                    ref={nameRef}
                    className={`${houseOfDiamsWordmarkFont.className} inline-block text-[28px] font-normal tracking-[0.04em] text-[#0A0A0A] md:text-[38px]`}
                  >
                    {displayName}
                  </span>
                </Link>
              ) : (
                <span
                  ref={nameRef}
                  className={`${houseOfDiamsWordmarkFont.className} inline-block text-[28px] font-normal tracking-[0.04em] text-[#0A0A0A] md:text-[38px]`}
                >
                  {displayName}
                </span>
              )}
            </div>
            <div className="overflow-hidden">
              <p
                ref={descRef}
                className="mx-auto mt-2.5 max-w-[440px] text-[15px] font-light leading-[1.5] text-[#303030] md:text-[17px]"
              >
                {displayDesc}
              </p>
            </div>
            {displayHref ? (
              <Link
                href={displayHref}
                className="mt-4 inline-flex items-center justify-center border-b border-[#0A1628] pb-1 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#0A1628] transition-opacity hover:opacity-70"
              >
                Explore Rings
              </Link>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            disabled={animating}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#0A1628]/14 text-[#0A1628] transition-colors hover:bg-[#0A1628] hover:text-white disabled:opacity-60 md:h-14 md:w-14"
            aria-label="Next ring"
          >
            <Chevron direction="right" />
          </button>
        </div>

      </div>
    </section>
  );
}
