'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogSectionHeader from '@/components/blog/BlogSectionHeader';
import Hero from '@/components/home/Hero';
import TestimonialMarquee from '@/components/home/TestimonialMarquee';
import BlogGrid from '@/components/blog/BlogGrid';
import { posts } from '@/lib/data/blog-posts';
import type { BlogPost } from '@/lib/data/blog-posts';
import DiamondInfo from '@/components/home/DiamondInfo';
import Collection from '@/components/home/Collection';
import MaterialStrip from '@/components/home/MaterialStrip';
import HipHopShowcase from '@/components/home/HipHopShowcase';
import Certifications from '@/components/home/Certifications';
import Testimonials from '@/components/home/Testimonials';
import CouplesSection from '@/components/home/CouplesSection';
import Newsletter from '@/components/home/Newsletter';
import BestSellers from '@/components/home/BestSellers';
import EnquireModal from '@/components/home/EnquireModal';
import Toast from '@/components/home/Toast';
import { useHomeLoader } from '@/components/layout/HomeLoaderContext';
import type {
  HomeBestSellerProduct,
  HomeBestSellerSection,
  HomeCertificationItem,
  HomeCertificationSection,
  HomeCollectionItem,
  HomeCoupleItem,
  HomeDiamondInfoItem,
  HomeHipHopSection,
  HomeMarqueeData,
  HomeMaterialItem,
  HomeTestimonialsData,
} from '@/lib/home-data';

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

const HOME_LOADER_CACHE_KEY = 'hod_home_loader_v1';
const HOME_LOADER_CACHE_TTL_MS = 1000 * 60 * 60 * 12;

export default function HomeClient({
  heroContent,
  blogPosts = posts,
  collectionItems = [],
  materialItems = [],
  hiphopSection,
  certificationsSection,
  certificationItems = [],
  couplesData,
  diamondInfoItems = [],
  testimonialsData,
  marqueeData,
  bestSellerSection,
  bestSellerProducts = [],
}: {
  heroContent?: HeroContent
  blogPosts?: BlogPost[]
  collectionItems?: HomeCollectionItem[]
  materialItems?: HomeMaterialItem[]
  hiphopSection: HomeHipHopSection
  certificationsSection: HomeCertificationSection
  certificationItems?: HomeCertificationItem[]
  couplesData: { eyebrow: string; heading: string; subtitle: string; items: HomeCoupleItem[] }
  diamondInfoItems?: HomeDiamondInfoItem[]
  testimonialsData: HomeTestimonialsData
  marqueeData: HomeMarqueeData
  bestSellerSection: HomeBestSellerSection
  bestSellerProducts?: HomeBestSellerProduct[]
}) {
  const router = useRouter();
  const { setIsHomeLoading } = useHomeLoader();
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [enquireGemName, setEnquireGemName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const cached = window.localStorage.getItem(HOME_LOADER_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { expiresAt?: number } | null;
        if (parsed?.expiresAt && parsed.expiresAt > Date.now()) {
          setIsHomeLoading(false);
          return;
        }
      }
    } catch {}

    setIsHomeLoading(true);

    return () => {
      setIsHomeLoading(false);
    };
  }, [setIsHomeLoading]);
  const handleEnquireClose = () => {
    setIsEnquireOpen(false);
    setEnquireGemName('');
  };

  const handleToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(
        HOME_LOADER_CACHE_KEY,
        JSON.stringify({ expiresAt: Date.now() + HOME_LOADER_CACHE_TTL_MS })
      );
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <Hero initialContent={heroContent} />
      <TestimonialMarquee initialData={marqueeData} />
      <Collection items={collectionItems} />
      <DiamondInfo items={diamondInfoItems} />
      <MaterialStrip items={materialItems} />
      <HipHopShowcase initialSection={hiphopSection} />
      <BestSellers initialSection={bestSellerSection} initialProducts={bestSellerProducts} />
      <Certifications initialSection={certificationsSection} initialItems={certificationItems} />
      <Testimonials initialData={testimonialsData} />
      <CouplesSection initialData={couplesData} />

      <section className="bg-[var(--theme-surface-warm)] px-5 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <BlogSectionHeader title="Blogs" onViewAll={() => router.push('/blog')} />
          <BlogGrid posts={blogPosts} onPostClick={(id) => {
            const target = blogPosts.find((post) => post.id === id)
            router.push(target?.slug ? `/blog?slug=${target.slug}` : `/blog?post=${id}`)
          }} />
        </div>
      </section>
      <Newsletter onToast={handleToast} />

      {isEnquireOpen && <EnquireModal open={isEnquireOpen} piece={enquireGemName} onClose={handleEnquireClose} />}
      <Toast message={toastMessage} visible={showToast} />
    </div>
  );
}
