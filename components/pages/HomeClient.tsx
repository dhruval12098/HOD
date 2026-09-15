'use client';

import dynamic from 'next/dynamic';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Hero from '@/components/home/Hero';
import ShopByCategory from '@/components/home/ShopByCategory';
import TestimonialMarquee from '@/components/home/TestimonialMarquee';
import TrustedPartnersMarquee from '@/components/home/TrustedPartnersMarquee';
import Certifications from '@/components/home/Certifications';
import ViewportDeferred from '@/components/home/ViewportDeferred';
import { posts } from '@/lib/data/blog-posts';
import type { BlogPost } from '@/lib/data/blog-posts';
import EnquireModal from '@/components/home/EnquireModal';
import BespokeEnquiryModal from '@/components/home/BespokeEnquiryModal';
import Toast from '@/components/home/Toast';
import { useHomeLoader } from '@/components/layout/HomeLoaderContext';
import { persistHomeLoaderCache, shouldSkipHomeLoader } from '@/lib/home-loader-cache';
import type {
  HomeBestSellerProduct,
  HomeBestSellerSection,
  HomeBespokeShowcaseSection,
  HomeDiscoverItem,
  HomeDiamondInfoConfig,
  HomeDiamondInfoItem,
  HomeHipHopSection,
  HomeMarqueeData,
  HomeTrustedPartnersData,
} from '@/lib/home-data';
import type { ShopByCategoryData } from '@/lib/shop-by-category';

const HipHopShowcase = dynamic(() => import('@/components/home/HipHopShowcase'), { loading: () => null });
const DiscoverShapes = dynamic(() => import('@/components/home/DiscoverShapes'), { loading: () => null });
const BestSellers = dynamic(() => import('@/components/home/BestSellers'), { loading: () => null });
const CollectionShowcase = dynamic(() => import('@/components/home/CollectionShowcase'), { loading: () => null });
const BespokeShowcase = dynamic(() => import('@/components/home/BespokeShowcase'), { loading: () => null });
const DiamondInfoSequence = dynamic(() => import('@/components/home/DiamondInfoSequence'), { loading: () => null });
const Newsletter = dynamic(() => import('@/components/home/Newsletter'), { loading: () => null });
const DeferredBlogGrid = dynamic(() => import('@/components/blog/BlogGrid'), { loading: () => null });
const SelectedCouponOffer = dynamic(() => import('@/components/home/SelectedCouponOffer'), { loading: () => null });

type CollectionPageConfig = {
  pageEnabled: boolean
  showInFooter: boolean
  showHomeShowcase: boolean
  showcaseHeading: string
  showcaseSubtitle: string
  showcaseCtaLabel: string
  showcaseCtaHref: string
  showcaseImageUrl?: string
  showcaseMobileImageUrl?: string
}

type HeroContent = {
  eyebrow: string;
  headline: string;
  subtitle: string;
  slider_enabled?: boolean;
  slider_items?: Array<{
    sort_order: number;
    image_path: string;
    mobile_image_path?: string;
    headline: string;
    subtitle: string;
    button_text: string;
    button_link: string;
  }>;
};

export default function HomeClient({
  heroContent,
  shopByCategory,
  blogPosts = posts,
  discoverShapesItems = [],
  hiphopSection,
  collectionPageConfig,
  bespokeShowcaseSection,
  diamondInfoItems = [],
  diamondInfoConfig,
  marqueeData,
  trustedPartnersData,
  bestSellerSection,
  bestSellerProducts = [],
}: {
  heroContent?: HeroContent
  shopByCategory: ShopByCategoryData | null
  blogPosts?: BlogPost[]
  discoverShapesItems?: HomeDiscoverItem[]
  hiphopSection: HomeHipHopSection
  collectionPageConfig: CollectionPageConfig
  bespokeShowcaseSection: HomeBespokeShowcaseSection
  diamondInfoItems?: HomeDiamondInfoItem[]
  diamondInfoConfig?: HomeDiamondInfoConfig
  marqueeData: HomeMarqueeData
  trustedPartnersData?: HomeTrustedPartnersData
  bestSellerSection: HomeBestSellerSection
  bestSellerProducts?: HomeBestSellerProduct[]
}) {
  const router = useRouter();
  const { isHomeReady, setIsHomeLoading, setIsHomeReady } = useHomeLoader();
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [isBespokeEnquireOpen, setIsBespokeEnquireOpen] = useState(false);
  const [enquireGemName, setEnquireGemName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [skipHomeLoader, setSkipHomeLoader] = useState(false);
  const [showDeferredSections, setShowDeferredSections] = useState(false);
  const showPrimarySections = skipHomeLoader || isHomeReady;

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const shouldSkipLoader = shouldSkipHomeLoader();

    setSkipHomeLoader(shouldSkipLoader);
    if (shouldSkipLoader) {
      setIsHomeReady(true);
      setIsHomeLoading(false);
    } else {
      setIsHomeReady(false);
      setIsHomeLoading(true);
    }

    return () => {
      setIsHomeLoading(false);
      setIsHomeReady(false);
    };
  }, [setIsHomeLoading, setIsHomeReady]);

  useEffect(() => {
    if (skipHomeLoader) {
      setFontsReady(true);
      return;
    }

    let cancelled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!cancelled) {
        setFontsReady(true);
      }
    }, 2500);

    if (typeof document !== 'undefined' && 'fonts' in document && document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (!cancelled) {
            setFontsReady(true);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setFontsReady(true);
          }
        });
    } else {
      setFontsReady(true);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackTimer);
    };
  }, [skipHomeLoader]);

  useEffect(() => {
    if (skipHomeLoader || heroReady) return;

    const fallbackTimer = window.setTimeout(() => {
      setHeroReady(true);
    }, 4500);

    return () => {
      window.clearTimeout(fallbackTimer);
    };
  }, [heroReady, skipHomeLoader]);

  useEffect(() => {
    if (!skipHomeLoader && (!heroReady || !fontsReady)) return;

    if (skipHomeLoader) {
      setIsHomeReady(true);
      persistHomeLoaderCache();
      return;
    }

    let frameOne = 0;
    let frameTwo = 0;

    frameOne = window.requestAnimationFrame(() => {
      frameTwo = window.requestAnimationFrame(() => {
        setIsHomeReady(true);
        persistHomeLoaderCache();
      });
    });

    return () => {
      window.cancelAnimationFrame(frameOne);
      window.cancelAnimationFrame(frameTwo);
    };
  }, [fontsReady, heroReady, setIsHomeReady, skipHomeLoader]);

  useEffect(() => {
    if (showPrimarySections) {
      setShowDeferredSections((current) => current || skipHomeLoader);
    }
  }, [showPrimarySections, skipHomeLoader]);

  useEffect(() => {
    if (!skipHomeLoader && !isHomeReady) {
      setShowDeferredSections(false);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    let idleId: number | null = null;

    const revealDeferredSections = () => {
      if (cancelled) return;
      window.requestAnimationFrame(() => {
        if (!cancelled) {
          setShowDeferredSections(true);
        }
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = (window as Window & {
        requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      }).requestIdleCallback(() => revealDeferredSections(), { timeout: 1200 });
    } else if (typeof window !== 'undefined') {
      timeoutId = globalThis.setTimeout(revealDeferredSections, 180);
    } else {
      setShowDeferredSections(true);
    }

    return () => {
      cancelled = true;
      if (timeoutId) {
        globalThis.clearTimeout(timeoutId);
      }
      if (idleId != null && typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        (window as Window & {
          cancelIdleCallback: (handle: number) => void;
        }).cancelIdleCallback(idleId);
      }
    };
  }, [isHomeReady, skipHomeLoader]);

  const handleEnquireClose = () => {
    setIsEnquireOpen(false);
    setEnquireGemName('');
  };

  const handleToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <Hero
        initialContent={heroContent}
        onPrimaryVisualReady={() => {
          setHeroReady(true);
        }}
      />
      <ShopByCategory data={shopByCategory} />
      {showPrimarySections ? (
        <>
          {collectionPageConfig.pageEnabled && collectionPageConfig.showHomeShowcase ? <CollectionShowcase config={collectionPageConfig} /> : null}
          <ViewportDeferred minHeight={620}>
            <BestSellers initialSection={bestSellerSection} initialProducts={bestSellerProducts} />
          </ViewportDeferred>
          <ViewportDeferred minHeight={520}>
            <DiscoverShapes initialItems={discoverShapesItems} />
          </ViewportDeferred>
          {bespokeShowcaseSection.isEnabled ? (
            <BespokeShowcase section={bespokeShowcaseSection} onEnquireClick={() => setIsBespokeEnquireOpen(true)} />
          ) : null}
          {/* <TrustedPartnersMarquee data={trustedPartnersData} /> */}
          {/* <TestimonialMarquee initialData={marqueeData} /> */}
          {/* <Certifications /> */}
          {showDeferredSections ? (
            <section aria-labelledby="home-blogs-heading" className="bg-[var(--color-brand-accent,#fff)] px-[var(--space-2)] py-[var(--space-12)] sm:px-[var(--space-3)] lg:px-[var(--space-4)] lg:py-[var(--space-12)]">
              <div className="w-full">
                <h2 id="home-blogs-heading" className="section-title mb-[var(--space-6)] text-[clamp(1.7rem,2.4vw,2.4rem)] leading-[1.12] text-[var(--theme-heading)]">Blogs</h2>
                <DeferredBlogGrid posts={blogPosts} maxPosts={4} compactGrid simplifiedCards onPostClick={(id) => {
                  const target = blogPosts.find((post) => post.id === id)
                  router.push(target?.slug ? `/blog/${target.slug}` : `/blog?post=${id}`)
                }} />
                <div className="mt-[var(--space-6)] flex justify-center">
                  <Link href="/blog" className="inline-flex min-h-12 items-center justify-center bg-[var(--color-brand-primary,#000)] px-[var(--space-6)] font-[family-name:var(--font-family-button)] text-xs font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-primary,#000)]">View All Blogs</Link>
                </div>
              </div>
            </section>
          ) : null}
          <SelectedCouponOffer />
        </>
      ) : null}
      {/* {hiphopSection.is_enabled ? <HipHopShowcase initialSection={hiphopSection} /> : null} */}
      {/* About Us video-led section; uncomment to restore:
          <ViewportDeferred minHeight={520}>
            <DiamondInfoSequence items={diamondInfoItems} config={diamondInfoConfig} />
          </ViewportDeferred>
      */}
      {/* <Newsletter onToast={handleToast} /> */}

      {isEnquireOpen && <EnquireModal open={isEnquireOpen} piece={enquireGemName} onClose={handleEnquireClose} />}
      <BespokeEnquiryModal open={isBespokeEnquireOpen} onClose={() => setIsBespokeEnquireOpen(false)} />
      <Toast message={toastMessage} visible={showToast} />
    </div>
  );
}
