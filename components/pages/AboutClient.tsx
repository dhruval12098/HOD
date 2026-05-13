'use client';

import Loader from '@/components/home/Loader';
import TrustStrip from '@/components/home/TrustStrip';
import AboutHero from '@/components/about/AboutHero';
import FoundersSection from '@/components/about/FoundersSection';
import TimelineSection from '@/components/about/TimelineSection';
import ValuesSection from '@/components/about/ValuesSection';
import Manufacturing from '@/components/home/Manufacturing';
import { usePageLoaderCache } from '@/lib/hooks/usePageLoaderCache';

export default function AboutClient({
  hero,
  founders,
  timeline,
  values,
  manufacturingItems,
}: {
  hero?: { eyebrow?: string | null; heading?: string | null; subtitle?: string | null } | null;
  founders?: Array<{ sort_order?: number; name: string; designation: string; bio: string; image_path?: string | null }>;
  timeline?: Array<{ id?: number | string; sort_order?: number; year: string; label: string }>;
  values?: Array<{ id?: number | string; sort_order?: number; icon_path?: string | null; title: string; description: string }>;
  manufacturingItems?: any[];
}) {
  const { pageLoading, handleLoaderComplete } = usePageLoaderCache({
    cacheKey: 'hod_about_loader_v1',
    ttlMs: 1000 * 60 * 60 * 12,
    fallbackDelayMs: 260,
  });

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      {pageLoading ? <Loader ready onComplete={handleLoaderComplete} /> : null}

      <Manufacturing initialItems={manufacturingItems ?? []} />
      <FoundersSection initialItems={founders ?? []} />
      <TimelineSection initialItems={timeline ?? []} />
      <ValuesSection initialItems={values ?? []} />
    </div>
  );
}
