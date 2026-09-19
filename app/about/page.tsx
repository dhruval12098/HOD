import type { Metadata } from 'next';
import AboutClient from '@/components/pages/AboutClient';
import { createClient } from '@supabase/supabase-js';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({ title: 'About', description: 'Learn about House of Diams: our founders, milestones, and values.', path: '/about' });
export const revalidate = 300;

export default async function AboutPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) return <AboutClient hero={null} wideBanner={null} founders={[]} timeline={[]} values={[]} />;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const bucket = process.env.SUPABASE_COLLECTION_BUCKET ?? process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod';
  const publicUrl = (path?: string | null) => !path ? '' : /^https?:\/\//i.test(path) ? path : `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  const [heroResult, bannerResult, foundersResult, timelineResult, valuesResult] = await Promise.all([
    supabase.from('about_hero').select('is_enabled, media_type, desktop_media_path, mobile_media_path, video_poster_path, media_alt, show_text_overlay, heading, paragraph, show_button, button_label, button_link, overlay_position, overlay_scrim_enabled').eq('section_key', 'about_hero').maybeSingle(),
    supabase.from('about_wide_banner').select('is_enabled, desktop_image_path, mobile_image_path, image_alt, heading, paragraph, show_button, button_label, button_link, content_position, sort_order').eq('section_key', 'about_wide_banner').maybeSingle(),
    supabase.from('about_founders').select('sort_order, name, designation, bio, image_path').order('sort_order', { ascending: true }),
    supabase.from('about_timeline').select('id, sort_order, year, label').order('sort_order', { ascending: true }),
    supabase.from('about_values').select('id, sort_order, icon_path, image_path, image_alt, title, description').order('sort_order', { ascending: true }),
  ]);
  const hero = heroResult.data ? { ...heroResult.data, desktop_media_url: publicUrl(heroResult.data.desktop_media_path), mobile_media_url: publicUrl(heroResult.data.mobile_media_path || heroResult.data.desktop_media_path), video_poster_url: publicUrl(heroResult.data.video_poster_path) } : null;
  const wideBanner = bannerResult.data ? { ...bannerResult.data, desktop_image_url: publicUrl(bannerResult.data.desktop_image_path), mobile_image_url: publicUrl(bannerResult.data.mobile_image_path || bannerResult.data.desktop_image_path) } : null;
  return <AboutClient hero={hero} wideBanner={wideBanner} founders={foundersResult.data ?? []} timeline={timelineResult.data ?? []} values={valuesResult.data ?? []} />;
}

