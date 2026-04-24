import type { Metadata } from 'next';
import TrustStrip from '@/components/home/TrustStrip';
import AboutHero from '@/components/about/AboutHero';
import FoundersSection from '@/components/about/FoundersSection';
import TimelineSection from '@/components/about/TimelineSection';
import ValuesSection from '@/components/about/ValuesSection';
import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about House of Diams: our founders, milestones, and values.',
};

export default async function AboutPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let hero = null;

  if (supabaseUrl && supabaseServiceRoleKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data } = await supabase
      .from('about_hero')
      .select('eyebrow, heading, subtitle')
      .eq('section_key', 'about_hero')
      .maybeSingle();
    hero = data ?? null;
  }

  return (
    <div className="min-h-screen bg-(--bg) text-(--ink)">
      <TrustStrip />
      <AboutHero content={hero ?? undefined} />
      <FoundersSection />
      <TimelineSection />
      <ValuesSection />
    </div>
  );
}
