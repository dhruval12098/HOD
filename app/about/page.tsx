import type { Metadata } from 'next';
import AboutClient from '@/components/pages/AboutClient';
import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about House of Diams: our founders, milestones, and values.',
};

export default async function AboutPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let hero = null;
  let manufacturingItems: any[] = [];

  if (supabaseUrl && supabaseServiceRoleKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod';
    const buildPublicUrl = (path?: string | null) =>
      path ? `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}` : '';

    const [heroResult, foundersResult, timelineResult, valuesResult, manufacturingResult] = await Promise.all([
      supabase.from('about_hero').select('eyebrow, heading, subtitle').eq('section_key', 'about_hero').maybeSingle(),
      supabase.from('about_founders').select('sort_order, name, designation, bio, image_path').order('sort_order', { ascending: true }),
      supabase.from('about_timeline').select('id, sort_order, year, label').order('sort_order', { ascending: true }),
      supabase.from('about_values').select('id, sort_order, icon_path, title, description').order('sort_order', { ascending: true }),
      supabase.from('bespoke_process_steps').select('id, sort_order, step, eyebrow, title, description, image_path').order('sort_order', { ascending: true }),
    ]);
    hero = heroResult.data ?? null;
    manufacturingItems = (manufacturingResult.data ?? []).map((item: any) => ({
      ...item,
      image_url: buildPublicUrl(item.image_path),
    }));
    return (
      <AboutClient
        hero={hero}
        founders={foundersResult.data ?? []}
        timeline={timelineResult.data ?? []}
        values={valuesResult.data ?? []}
        manufacturingItems={manufacturingItems}
      />
    );
  }

  return <AboutClient hero={hero} founders={[]} timeline={[]} values={[]} manufacturingItems={manufacturingItems} />;
}
