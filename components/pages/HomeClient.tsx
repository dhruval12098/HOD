'use client';

import dynamic from 'next/dynamic';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogSectionHeader from '@/components/blog/BlogSectionHeader';
import Hero from '@/components/home/Hero';
import TestimonialMarquee from '@/components/home/TestimonialMarquee';
import TrustedPartnersMarquee from '@/components/home/TrustedPartnersMarquee';
import Collection from '@/components/home/Collection';
import Certifications from '@/components/home/Certifications';
import DiscoverShapes from '@/components/home/DiscoverShapes';
import BlogGrid from '@/components/blog/BlogGrid';
import { posts } from '@/lib/data/blog-posts';
import type { BlogPost } from '@/lib/data/blog-posts';
import EnquireModal from '@/components/home/EnquireModal';
import Toast from '@/components/home/Toast';
import { useHomeLoader } from '@/components/layout/HomeLoaderContext';
import { persistHomeLoaderCache, shouldSkipHomeLoader } from '@/lib/home-loader-cache';
import type {
  HomeBestSellerProduct,
  HomeBestSellerSection,
  HomeCollectionItem,
  HomeCoupleItem,
  HomeDiscoverItem,
  HomeDiamondInfoConfig,
  HomeDiamondInfoItem,
  HomeHipHopSection,
  HomeMarqueeData,
  HomeTestimonialsData,
  HomeTrustedPartnersData,
} from '@/lib/home-data';

const HipHopShowcase = dynamic(() => import('@/components/home/HipHopShowcase'), { loading: () => null });
const BestSellers = dynamic(() => import('@/components/home/BestSellers'), { loading: () => null });
const CollectionShowcase = dynamic(() => import('@/components/home/CollectionShowcase'), { loading: () => null });
const DiscoverRings = dynamic(() => import('@/components/home/DiscoverRings'), { loading: () => null });
const DiamondInfoSequence = dynamic(() => import('@/components/home/DiamondInfoSequence'), { loading: () => null });
const Testimonials = dynamic(() => import('@/components/home/Testimonials'), { loading: () => null });
const CouplesSection = dynamic(() => import('@/components/home/CouplesSection'), { loading: () => null });
const Newsletter = dynamic(() => import('@/components/home/Newsletter'), { loading: () => null });
const DeferredBlogGrid = dynamic(() => import('@/components/blog/BlogGrid'), { loading: () => null });

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
    button_text: string;
    button_link: string;
  }>;
};

export default function HomeClient({
  heroContent,
  blogPosts = posts,
  collectionItems = [],
  discoverShapesItems = [],
  discoverRingsItems = [],
  hiphopSection,
  collectionPageConfig,
  couplesData,
  diamondInfoItems = [],
  diamondInfoConfig,
  testimonialsData,
  marqueeData,
  trustedPartnersData,
  bestSellerSection,
  bestSellerProducts = [],
}: {
  heroContent?: HeroContent
  blogPosts?: BlogPost[]
  collectionItems?: HomeCollectionItem[]
  discoverShapesItems?: HomeDiscoverItem[]
  discoverRingsItems?: HomeDiscoverItem[]
  hiphopSection: HomeHipHopSection
  collectionPageConfig: CollectionPageConfig
  couplesData: { eyebrow: string; heading: string; subtitle: string; items: HomeCoupleItem[] }
  diamondInfoItems?: HomeDiamondInfoItem[]
  diamondInfoConfig?: HomeDiamondInfoConfig
  testimonialsData: HomeTestimonialsData
  marqueeData: HomeMarqueeData
  trustedPartnersData?: HomeTrustedPartnersData
  bestSellerSection: HomeBestSellerSection
  bestSellerProducts?: HomeBestSellerProduct[]
}) {
  const router = useRouter();
  const { isHomeReady, setIsHomeLoading, setIsHomeReady } = useHomeLoader();
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
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
      {showPrimarySections ? (
        <>
          <TrustedPartnersMarquee data={trustedPartnersData} />
          {/* <TestimonialMarquee initialData={marqueeData} /> */}
          <Collection items={collectionItems} />
          <Certifications />
          <DiscoverShapes initialItems={discoverShapesItems} />
        </>
      ) : null}
      {showDeferredSections ? (
        <>
          {hiphopSection.is_enabled ? <HipHopShowcase initialSection={hiphopSection} /> : null}
          <BestSellers initialSection={bestSellerSection} initialProducts={bestSellerProducts} />
          {collectionPageConfig.pageEnabled && collectionPageConfig.showHomeShowcase ? <CollectionShowcase config={collectionPageConfig} /> : null}
          <DiscoverRings initialItems={discoverRingsItems} />
          <DiamondInfoSequence items={diamondInfoItems} config={diamondInfoConfig} />
          <Testimonials initialData={testimonialsData} />
          <CouplesSection initialData={couplesData} />

          <section className="bg-[var(--theme-surface-warm)] px-5 py-16 md:px-8 lg:px-12">
            <div className="mx-auto max-w-[1320px]">
              <BlogSectionHeader title="Blogs" onViewAll={() => router.push('/blog')} />
              <DeferredBlogGrid posts={blogPosts} onPostClick={(id) => {
                const target = blogPosts.find((post) => post.id === id)
                router.push(target?.slug ? `/blog?slug=${target.slug}` : `/blog?post=${id}`)
              }} />
            </div>
          </section>
          <Newsletter onToast={handleToast} />
        </>
      ) : null}

      {isEnquireOpen && <EnquireModal open={isEnquireOpen} piece={enquireGemName} onClose={handleEnquireClose} />}
      <Toast message={toastMessage} visible={showToast} />
    </div>
  );
}
