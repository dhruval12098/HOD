import type { Metadata } from 'next';
import TrustStrip from '@/components/home/TrustStrip';
import AboutHero from '@/components/about/AboutHero';
import FoundersSection from '@/components/about/FoundersSection';
import TimelineSection from '@/components/about/TimelineSection';
import ValuesSection from '@/components/about/ValuesSection';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about House of Diams: our founders, milestones, and values.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <TrustStrip />
      <AboutHero />
      <FoundersSection />
      <TimelineSection />
      <ValuesSection />
    </div>
  );
}
