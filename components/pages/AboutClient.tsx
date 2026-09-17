'use client';

import TrustStrip from '@/components/home/TrustStrip';
import AboutHero from '@/components/about/AboutHero';
import FoundersSection from '@/components/about/FoundersSection';
import TimelineSection from '@/components/about/TimelineSection';
import ValuesSection from '@/components/about/ValuesSection';
import Manufacturing from '@/components/home/Manufacturing';

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
  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <Manufacturing initialItems={manufacturingItems ?? []} />
      <FoundersSection initialItems={founders ?? []} />
      <TimelineSection initialItems={timeline ?? []} />
      <ValuesSection initialItems={values ?? []} />
    </div>
  );
}
