'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { HomeDiamondInfoConfig, HomeDiamondInfoItem } from '@/lib/home-data';

gsap.registerPlugin(ScrollTrigger);

type StageRow = {
  label: string;
  heading: string;
  paragraph: string;
};

const FRAME_COUNT = 544;
const FRAME_PATH = (index: number) => `/frames/frame_${String(index).padStart(4, '0')}.jpg`;
const MIN_SECTION_HEIGHT_VH = 700;
const HEIGHT_PER_STAGE_VH = 175;
const PRELOAD_PROGRESS_EMIT_EVERY = 20;

const FALLBACK_ROWS: StageRow[] = [
  {
    label: '01 - Carat',
    heading: 'Perfection by Weight',
    paragraph:
      'Every diamond is precision-cut to its exact carat and presented exactly as certified, with nothing hidden and nothing exaggerated.',
  },
  {
    label: '02 - Cut',
    heading: 'Light Mastered',
    paragraph:
      'Each facet is crafted to capture and return light beautifully, giving the stone its depth, fire, and unmistakable brilliance.',
  },
  {
    label: '03 - Clarity',
    heading: 'Nothing Hidden',
    paragraph:
      'Every stone is graded with care so the eye sees only beauty, while craftsmanship and purity stay evident in every angle.',
  },
  {
    label: '04 - Finish',
    heading: 'Elegant by Design',
    paragraph:
      'From silhouette to setting, every detail is refined to feel timeless, balanced, and unmistakably House of Diams.',
  },
];

function normalizeRows(items?: HomeDiamondInfoItem[]): StageRow[] {
  if (!items?.length) return FALLBACK_ROWS;

  return [...items]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item, index) => {
      const fallback = FALLBACK_ROWS[index % FALLBACK_ROWS.length];
      return {
        label: item.label?.trim() || fallback.label,
        heading: item.heading?.trim() || fallback.heading,
        paragraph: item.paragraph?.trim() || fallback.paragraph,
      };
    });
}

function splitHeadingRows(heading: string) {
  const explicit = heading
    .split(/\r?\n/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (explicit.length > 1) return explicit;

  const words = heading.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) return words.length ? words : [heading.trim()];

  const pivot = Math.ceil(words.length / 2);
  return [words.slice(0, pivot).join(' '), words.slice(pivot).join(' ')];
}

const frameStore: {
  frames: Array<HTMLImageElement | null>;
  loaded: number;
  ready: boolean;
  firstReady: boolean;
  listeners: Set<() => void>;
} = {
  frames: new Array(FRAME_COUNT + 1).fill(null),
  loaded: 0,
  ready: false,
  firstReady: false,
  listeners: new Set(),
};

function notifyFrameListeners() {
  frameStore.listeners.forEach((listener) => listener());
}

function preloadFrames() {
  if (frameStore.ready || frameStore.loaded > 0) return;

  const load = (index: number, priority: 'high' | 'low') => {
    if (frameStore.frames[index]) return;

    const image = new Image();
    image.decoding = 'async';
    try {
      (image as HTMLImageElement & { fetchPriority?: string }).fetchPriority = priority;
    } catch {
      // Older browsers can ignore fetchPriority.
    }

    image.onload = () => {
      frameStore.frames[index] = image;
      frameStore.loaded += 1;

      if (index === 1) {
        frameStore.firstReady = true;
        notifyFrameListeners();
      } else if (frameStore.loaded % PRELOAD_PROGRESS_EMIT_EVERY === 0) {
        notifyFrameListeners();
      }

      if (frameStore.loaded === FRAME_COUNT) {
        frameStore.ready = true;
        notifyFrameListeners();
      }
    };

    image.src = FRAME_PATH(index);
  };

  load(1, 'high');
  for (let index = 2; index <= FRAME_COUNT; index += 1) {
    load(index, index <= 12 ? 'high' : 'low');
  }
}

if (typeof window !== 'undefined') {
  preloadFrames();
}

export default function DiamondInfoSequence({
  items = [],
  config,
}: {
  items?: HomeDiamondInfoItem[];
  config?: HomeDiamondInfoConfig;
}) {
  void config;

  const stages = useMemo(() => normalizeRows(items), [items]);
  const sectionHeight = `${Math.max(MIN_SECTION_HEIGHT_VH, stages.length * HEIGHT_PER_STAGE_VH)}vh`;

  const [activeStage, setActiveStage] = useState(0);
  const [firstReady, setFirstReady] = useState(frameStore.firstReady);

  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leftTextRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rightTextRefs = useRef<Array<HTMLDivElement | null>>([]);
  const previousStageRef = useRef<number | null>(null);
  const currentFrameRef = useRef(1);

  useEffect(() => {
    const onStoreUpdate = () => {
      setFirstReady(frameStore.firstReady);
    };

    frameStore.listeners.add(onStoreUpdate);
    return () => {
      frameStore.listeners.delete(onStoreUpdate);
    };
  }, []);

  useLayoutEffect(() => {
    const leftBlocks = leftTextRefs.current.filter(Boolean) as HTMLDivElement[];
    const rightBlocks = rightTextRefs.current.filter(Boolean) as HTMLDivElement[];
    const previousStage = previousStageRef.current;
    previousStageRef.current = activeStage;

    const incoming = [leftBlocks[activeStage], rightBlocks[activeStage]].filter(Boolean);
    const outgoing =
      previousStage != null && previousStage !== activeStage
        ? [leftBlocks[previousStage], rightBlocks[previousStage]].filter(Boolean)
        : [];

    gsap.killTweensOf([...leftBlocks, ...rightBlocks]);
    gsap.set([...leftBlocks, ...rightBlocks], { autoAlpha: 0 });

    const timeline = gsap.timeline({
      defaults: { overwrite: 'auto' },
    });

    if (outgoing.length > 0) {
      gsap.set(outgoing, { autoAlpha: 1 });
      timeline.to(outgoing, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    gsap.set(incoming, { autoAlpha: 0 });
    timeline.to(
      incoming,
      {
        autoAlpha: 1,
        duration: 0.55,
        ease: 'power2.out',
      },
      outgoing.length > 0 ? 0.12 : 0
    );

    return () => {
      timeline.kill();
    };
  }, [activeStage, stages.length]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const canvasWrap = canvasWrapRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!section || !canvasWrap || !canvas || !context) return;

    let destroyed = false;
    let drawRaf = 0;
    const size = { width: 0, height: 0, dpr: 0 };

    const setCanvasSize = () => {
      const width = Math.max(1, canvasWrap.clientWidth);
      const height = Math.max(1, canvasWrap.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (size.width !== width || size.height !== height || size.dpr !== dpr) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        size.width = width;
        size.height = height;
        size.dpr = dpr;
      }

      return { width, height };
    };

    const drawFrame = (frameIndex: number) => {
      const image = frameStore.frames[frameIndex];
      if (!image) return;

      const { width, height } = setCanvasSize();
      const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;

      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    };

    const requestDraw = (frameIndex: number) => {
      currentFrameRef.current = frameIndex;
      if (drawRaf) return;

      drawRaf = window.requestAnimationFrame(() => {
        drawRaf = 0;
        if (!destroyed) {
          drawFrame(currentFrameRef.current);
        }
      });
    };

    if (frameStore.firstReady) {
      drawFrame(1);
    }

    const onStoreUpdate = () => {
      if (!destroyed) {
        requestDraw(currentFrameRef.current);
      }
    };

    frameStore.listeners.add(onStoreUpdate);

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate(self) {
        const frameIndex = Math.max(
          1,
          Math.min(FRAME_COUNT, Math.round(self.progress * (FRAME_COUNT - 1)) + 1)
        );
        requestDraw(frameIndex);

        const stageIndex = Math.min(
          Math.floor(self.progress * stages.length),
          stages.length - 1
        );
        setActiveStage((current) => (current === stageIndex ? current : stageIndex));
      },
    });

    const onResize = () => {
      if (!destroyed) {
        requestDraw(currentFrameRef.current);
      }
    };

    window.addEventListener('resize', onResize);

    return () => {
      destroyed = true;
      if (drawRaf) {
        window.cancelAnimationFrame(drawRaf);
      }
      window.removeEventListener('resize', onResize);
      frameStore.listeners.delete(onStoreUpdate);
      trigger.kill();
    };
  }, [stages.length]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-white"
      style={{ height: sectionHeight }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-white">
        <div className="mx-auto grid h-full w-full max-w-[1700px] grid-cols-1 grid-rows-[auto_auto_minmax(320px,48vh)] items-center gap-3 px-5 py-6 sm:gap-5 sm:px-8 sm:py-8 md:px-10 lg:grid-cols-[minmax(240px,1fr)_minmax(420px,52vw)_minmax(240px,1fr)] lg:grid-rows-1 lg:gap-8 lg:px-12 xl:px-16">
          <div className="order-1 relative flex min-h-[156px] items-center justify-center sm:min-h-[190px] lg:min-h-[520px]">
            {stages.map((stage, index) => (
              <div
                key={`left-${index}`}
                ref={(node) => {
                  leftTextRefs.current[index] = node;
                }}
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-start px-2 pt-2 text-center sm:justify-center sm:pt-0 lg:items-start lg:text-left"
              >
                <p
                  className="text-[10px] uppercase tracking-[0.34em] text-[#8a8f99] sm:text-[11px]"
                  style={{ fontFamily: 'var(--font-geist-sans), Arial, sans-serif' }}
                >
                  {stage.label}
                </p>
                <h2
                  className="mt-4 max-w-[12ch] text-[2.2rem] leading-[1.18] text-[#111111] sm:text-[2.75rem] sm:leading-[1.14] lg:text-[3.35rem] lg:leading-[1.08] xl:text-[3.8rem] xl:leading-[1.04]"
                  style={{ fontFamily: 'var(--display-title)' }}
                >
                  {splitHeadingRows(stage.heading).map((row, rowIndex) => (
                    <span key={`${index}-row-${rowIndex}`} className="block">
                      {row}
                    </span>
                  ))}
                </h2>
              </div>
            ))}
          </div>

          <div
            ref={canvasWrapRef}
            className="order-3 relative h-full min-h-[320px] overflow-hidden rounded-[28px] bg-white lg:order-2 lg:min-h-[70vh]"
          >
            <canvas ref={canvasRef} className="block h-full w-full" />
            {!firstReady ? (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(248,248,248,0.96)_0%,rgba(255,255,255,1)_68%)]" />
            ) : null}
          </div>

          <div className="order-2 relative flex min-h-[88px] items-center justify-center sm:min-h-[120px] lg:order-3 lg:min-h-[440px]">
            {stages.map((stage, index) => (
              <div
                key={`right-${index}`}
                ref={(node) => {
                  rightTextRefs.current[index] = node;
                }}
                className="pointer-events-none absolute inset-0 flex items-start justify-center text-center sm:items-center lg:justify-end lg:text-left"
              >
                <div className="max-w-[320px] lg:max-w-[360px]">
                  <p
                    className="text-sm leading-[1.95] text-[#5f646d] sm:text-[15px] lg:text-base"
                    style={{ fontFamily: 'var(--font-geist-sans), Arial, sans-serif' }}
                  >
                    {stage.paragraph}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
