'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { HomeDiamondInfoConfig, HomeDiamondInfoItem } from '@/lib/home-data';

type StageRow = {
  label: string;
  heading: string;
  paragraph: string;
};

const FRAME_COUNT = 1086;
const FRAME_FOLDER = '/animation%20images/frames';
const MIN_SECTION_HEIGHT_VH = 700;
const HEIGHT_PER_STAGE_VH = 175;
const PRELOAD_PROGRESS_EMIT_EVERY = 24;
const PRELOAD_CONCURRENCY = 6;
const INTERACTIVE_FRAME_THRESHOLD = 180;

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

function frameUrl(index: number) {
  return `${FRAME_FOLDER}/frame_${String(index).padStart(4, '0')}.jpeg`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeRows(items?: HomeDiamondInfoItem[]): StageRow[] {
  if (!items?.length) return FALLBACK_ROWS;

  const ordered = [...items].sort((a, b) => a.sort_order - b.sort_order);
  return ordered.map((item, index) => {
    const fallback = FALLBACK_ROWS[index % FALLBACK_ROWS.length];
    return {
      label: item.label?.trim() || fallback.label,
      heading: item.heading?.trim() || fallback.heading,
      paragraph: item.paragraph?.trim() || fallback.paragraph,
    };
  });
}

function splitHeadingRows(heading: string) {
  const explicitRows = heading
    .split(/\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (explicitRows.length > 1) return explicitRows;

  const words = heading.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [heading.trim()];
  if (words.length === 2) return words;

  const pivot = Math.ceil(words.length / 2);
  return [words.slice(0, pivot).join(' '), words.slice(pivot).join(' ')];
}

type SequenceListener = () => void;

const diamondSequenceStore: {
  images: Array<HTMLImageElement | null>;
  loadedCount: number;
  firstFrameReady: boolean;
  ready: boolean;
  started: boolean;
  kickoffScheduled: boolean;
  promise: Promise<void> | null;
  listeners: Set<SequenceListener>;
} = {
  images: new Array(FRAME_COUNT + 1).fill(null),
  loadedCount: 0,
  firstFrameReady: false,
  ready: false,
  started: false,
  kickoffScheduled: false,
  promise: null,
  listeners: new Set(),
};

function emitDiamondSequenceUpdate() {
  diamondSequenceStore.listeners.forEach((listener) => listener());
}

function subscribeToDiamondSequence(listener: SequenceListener) {
  diamondSequenceStore.listeners.add(listener);
  return () => {
    diamondSequenceStore.listeners.delete(listener);
  };
}

function loadSequenceFrame(frame: number, priority: 'high' | 'low' = 'low') {
  if (diamondSequenceStore.images[frame]) {
    return Promise.resolve(diamondSequenceStore.images[frame] as HTMLImageElement);
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    try {
      (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = priority;
    } catch {
      // No-op for browsers that do not support fetchPriority.
    }

    const complete = () => {
      if (!diamondSequenceStore.images[frame]) {
        diamondSequenceStore.images[frame] = img;
        diamondSequenceStore.loadedCount += 1;

        if (frame === 1) {
          diamondSequenceStore.firstFrameReady = true;
        }

        if (
          diamondSequenceStore.loadedCount === 1 ||
          diamondSequenceStore.loadedCount % PRELOAD_PROGRESS_EMIT_EVERY === 0 ||
          diamondSequenceStore.loadedCount === FRAME_COUNT
        ) {
          emitDiamondSequenceUpdate();
        }
      }

      resolve(img);
    };

    img.onload = complete;
    img.onerror = () => reject(new Error(`Failed to load diamond sequence frame ${frame}.`));
    img.src = frameUrl(frame);
  });
}

function ensureDiamondSequencePoster() {
  if (diamondSequenceStore.firstFrameReady) return;

  void loadSequenceFrame(1, 'high')
    .then(() => {
      emitDiamondSequenceUpdate();
    })
    .catch(() => {
      // Keep the section usable even if the poster fails.
    });
}

function ensureDiamondSequencePreload() {
  if (diamondSequenceStore.promise) return diamondSequenceStore.promise;

  diamondSequenceStore.started = true;
  diamondSequenceStore.promise = (async () => {
    await loadSequenceFrame(1, 'high').catch(() => null);

    let nextFrame = 2;
    const workers = Array.from({ length: PRELOAD_CONCURRENCY }, async (_, workerIndex) => {
      while (nextFrame <= FRAME_COUNT) {
        const frame = nextFrame;
        nextFrame += 1;
        const priority = frame <= PRELOAD_CONCURRENCY * 2 && workerIndex < 4 ? 'high' : 'low';
        await loadSequenceFrame(frame, priority).catch(() => null);
      }
    });

    await Promise.all(workers);
    diamondSequenceStore.ready = true;
    emitDiamondSequenceUpdate();
  })();

  return diamondSequenceStore.promise;
}

function findNearestLoadedFrame(target: number) {
  const safeTarget = clamp(target, 1, FRAME_COUNT);
  if (diamondSequenceStore.images[safeTarget]) return safeTarget;

  for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
    const lower = safeTarget - offset;
    if (lower >= 1 && diamondSequenceStore.images[lower]) return lower;

    const upper = safeTarget + offset;
    if (upper <= FRAME_COUNT && diamondSequenceStore.images[upper]) return upper;
  }

  return null;
}

function kickoffDiamondSequenceLoading() {
  if (typeof window === 'undefined' || diamondSequenceStore.kickoffScheduled) return;

  diamondSequenceStore.kickoffScheduled = true;
  ensureDiamondSequencePoster();

  window.setTimeout(() => {
    void ensureDiamondSequencePreload();
  }, 0);
}

kickoffDiamondSequenceLoading();

export default function DiamondInfoSequence({
  items = [],
  config,
}: {
  items?: HomeDiamondInfoItem[];
  config?: HomeDiamondInfoConfig;
}) {
  void config;

  const stages = useMemo(() => normalizeRows(items), [items]);
  const [activeStage, setActiveStage] = useState(0);
  const [firstFrameReady, setFirstFrameReady] = useState(diamondSequenceStore.firstFrameReady);
  const [loadedCount, setLoadedCount] = useState(diamondSequenceStore.loadedCount);
  const [allFramesReady, setAllFramesReady] = useState(diamondSequenceStore.ready);

  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leftTextRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rightTextRefs = useRef<Array<HTMLDivElement | null>>([]);

  const requestedFrameRef = useRef(1);
  const lastDrawnFrameRef = useRef(0);
  const previousStageRef = useRef<number | null>(null);
  const isInteractive = firstFrameReady && (allFramesReady || loadedCount >= INTERACTIVE_FRAME_THRESHOLD);

  useEffect(() => {
    ensureDiamondSequencePoster();
    const unsubscribe = subscribeToDiamondSequence(() => {
      setFirstFrameReady(diamondSequenceStore.firstFrameReady);
      setLoadedCount(diamondSequenceStore.loadedCount);
      setAllFramesReady(diamondSequenceStore.ready);
    });

    return unsubscribe;
  }, []);

  useLayoutEffect(() => {
    const leftBlocks = leftTextRefs.current.filter(Boolean) as HTMLDivElement[];
    const rightBlocks = rightTextRefs.current.filter(Boolean) as HTMLDivElement[];
    const previousStage = previousStageRef.current;
    previousStageRef.current = activeStage;
    const incomingBlockSet = [leftBlocks[activeStage], rightBlocks[activeStage]].filter(Boolean);
    const outgoingBlockSet =
      previousStage != null && previousStage !== activeStage
        ? [leftBlocks[previousStage], rightBlocks[previousStage]].filter(Boolean)
        : [];

    gsap.killTweensOf([...leftBlocks, ...rightBlocks]);
    gsap.set([...leftBlocks, ...rightBlocks], { autoAlpha: 0 });

    const timeline = gsap.timeline({
      defaults: { overwrite: 'auto' },
    });

    if (outgoingBlockSet.length > 0) {
      gsap.set(outgoingBlockSet, { autoAlpha: 1 });
      timeline.to(outgoingBlockSet, {
        autoAlpha: 0,
        duration: 0.34,
        ease: 'power2.out',
      });
    }

    gsap.set(incomingBlockSet, { autoAlpha: 0 });
    timeline.to(
      incomingBlockSet,
      {
        autoAlpha: 1,
        duration: 0.58,
        ease: 'power2.out',
      },
      outgoingBlockSet.length > 0 ? 0.14 : 0
    );

    return () => {
      timeline.kill();
    };
  }, [activeStage, stages.length]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const canvasWrap = canvasWrapRef.current;
    const context = canvas?.getContext('2d');

    if (!section || !canvas || !canvasWrap || !context) return;

    let destroyed = false;
    let renderRaf = 0;
    const sizeRef = { width: 0, height: 0, dpr: 0 };

    const setCanvasSize = () => {
      const width = Math.max(1, Math.round(canvasWrap.clientWidth));
      const height = Math.max(1, Math.round(canvasWrap.clientHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (
        sizeRef.width !== width ||
        sizeRef.height !== height ||
        sizeRef.dpr !== dpr
      ) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        sizeRef.width = width;
        sizeRef.height = height;
        sizeRef.dpr = dpr;
      }

      return { width, height };
    };

    const drawLoadedImage = (img: HTMLImageElement, frameIndex: number) => {
      const { width, height } = setCanvasSize();
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const drawWidth = img.naturalWidth * scale;
      const drawHeight = img.naturalHeight * scale;
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;

      context.clearRect(0, 0, width, height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      lastDrawnFrameRef.current = frameIndex;
    };

    const drawFrame = (frame: number) => {
      const targetFrame = clamp(frame, 1, FRAME_COUNT);
      requestedFrameRef.current = targetFrame;

      if (renderRaf) return;
      renderRaf = window.requestAnimationFrame(() => {
        renderRaf = 0;
        const finalFrame = requestedFrameRef.current;
        const exactImage = diamondSequenceStore.images[finalFrame];
        const resolvedFrame = exactImage ? finalFrame : findNearestLoadedFrame(finalFrame);
        const image = resolvedFrame ? diamondSequenceStore.images[resolvedFrame] : null;
        if (image) {
          drawLoadedImage(image, resolvedFrame ?? finalFrame);
        }

        const stageIndex = Math.min(
          Math.floor(((finalFrame - 1) / FRAME_COUNT) * stages.length),
          stages.length - 1
        );
        setActiveStage((current) => (current === stageIndex ? current : stageIndex));
      });
    };

    const resizeHandler = () => {
      const frame = lastDrawnFrameRef.current || requestedFrameRef.current;
      const image = diamondSequenceStore.images[frame];
      if (image) drawLoadedImage(image, frame);
    };

    window.addEventListener('resize', resizeHandler);

    const syncProgressToFrame = () => {
      const el = section;
      const rect = el.getBoundingClientRect();
      const totalScrollable = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const progress = clamp(scrolled / Math.max(totalScrollable, 1), 0, 1);
      const frame = Math.round(1 + progress * (FRAME_COUNT - 1));
      drawFrame(frame);
    };

    let lenisCleanup: (() => void) | null = null;

    const initScrollAnimation = () => {
      if (destroyed || lenisCleanup) return;

      syncProgressToFrame();

      const lenis = (window as typeof window & { __lenis?: { on?: (event: string, cb: () => void) => void; off?: (event: string, cb: () => void) => void } }).__lenis;
      if (lenis && typeof lenis.on === 'function' && typeof lenis.off === 'function') {
        lenis.on('scroll', syncProgressToFrame);
        lenisCleanup = () => lenis.off?.('scroll', syncProgressToFrame);
        return;
      }

      window.addEventListener('scroll', syncProgressToFrame, { passive: true });
      lenisCleanup = () => window.removeEventListener('scroll', syncProgressToFrame);
    };

    if (diamondSequenceStore.firstFrameReady && diamondSequenceStore.images[1]) {
      drawLoadedImage(diamondSequenceStore.images[1] as HTMLImageElement, 1);
    }

    if (diamondSequenceStore.firstFrameReady && !lastDrawnFrameRef.current && diamondSequenceStore.images[1]) {
      drawLoadedImage(diamondSequenceStore.images[1] as HTMLImageElement, 1);
    }

    if (isInteractive) {
      initScrollAnimation();
    } else {
      const unsubscribe = subscribeToDiamondSequence(() => {
        if (destroyed) return;

        if (!lastDrawnFrameRef.current && diamondSequenceStore.firstFrameReady && diamondSequenceStore.images[1]) {
          drawLoadedImage(diamondSequenceStore.images[1] as HTMLImageElement, 1);
        }

        if (
          diamondSequenceStore.firstFrameReady &&
          (diamondSequenceStore.ready || diamondSequenceStore.loadedCount >= INTERACTIVE_FRAME_THRESHOLD)
        ) {
          initScrollAnimation();
          unsubscribe();
        }
      });
    }

    return () => {
      destroyed = true;
      if (renderRaf) {
        window.cancelAnimationFrame(renderRaf);
      }
      window.removeEventListener('resize', resizeHandler);
      lenisCleanup?.();
    };
  }, [isInteractive, stages]);

  const sectionHeight = `${Math.max(MIN_SECTION_HEIGHT_VH, stages.length * HEIGHT_PER_STAGE_VH)}vh`;

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
                <div className="overflow-visible py-[0.2em]">
                  <p
                    className="text-[10px] uppercase tracking-[0.34em] text-[#8a8f99] sm:text-[11px]"
                    style={{ fontFamily: 'var(--font-geist-sans), Arial, sans-serif' }}
                  >
                    {stage.label}
                  </p>
                </div>
                <div className="mt-4 overflow-visible py-[0.56em]">
                  <h2
                    className="max-w-[12ch] text-[2.2rem] leading-[1.18] text-[#111111] sm:text-[2.75rem] sm:leading-[1.14] lg:text-[3.35rem] lg:leading-[1.08] xl:text-[3.8rem] xl:leading-[1.04]"
                    style={{ fontFamily: 'var(--display-title)' }}
                  >
                    {splitHeadingRows(stage.heading).map((row, rowIndex) => (
                      <span key={`${index}-row-${rowIndex}`} className="block overflow-visible py-[0.18em] first:pt-[0.08em] last:pb-[0.1em]">
                        <span className="block whitespace-nowrap">
                          {row}
                        </span>
                      </span>
                    ))}
                  </h2>
                </div>
              </div>
            ))}
          </div>

          <div
            ref={canvasWrapRef}
            className="order-3 relative h-full min-h-[320px] overflow-hidden rounded-[28px] bg-white lg:order-2 lg:min-h-[70vh]"
          >
            <canvas ref={canvasRef} className="block h-full w-full" />
            {!firstFrameReady ? <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(248,248,248,0.96)_0%,rgba(255,255,255,1)_68%)]" /> : null}
          </div>

          <div className="order-2 relative flex min-h-[88px] items-center justify-center sm:min-h-[120px] lg:order-3 lg:min-h-[440px]">
            {stages.map((stage, index) => (
              <div
                key={`right-${index}`}
                ref={(node) => {
                  rightTextRefs.current[index] = node;
                }}
                className="pointer-events-none absolute inset-0 flex items-start justify-center pt-0 text-center sm:items-center lg:justify-end lg:text-left"
              >
                <div className="max-w-[320px] lg:max-w-[360px]">
                  <div className="overflow-hidden py-[0.08em]">
                    <p
                      className="text-sm leading-[1.95] text-[#5f646d] sm:text-[15px] lg:text-base"
                      style={{ fontFamily: 'var(--font-geist-sans), Arial, sans-serif' }}
                    >
                      {stage.paragraph}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
