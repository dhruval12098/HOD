import type { Metadata } from 'next';
import BespokeClient from '@/components/pages/BespokeClient';
import { createClient } from '@supabase/supabase-js';

export const metadata: Metadata = {
  title: 'Bespoke',
  description: 'Commission a bespoke piece. From CAD to setting, crafted in Surat with natural or CVD diamonds.',
};

export default async function BespokePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return <BespokeClient />;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod';
  const buildPublicUrl = (path?: string | null) =>
    !path ? '' : path.startsWith('http://') || path.startsWith('https://')
      ? path
      : `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;

  const [heroResult, slidesResult, processResult, categoriesResult, portfolioItemsResult, manufacturingResult, settingsResult, guaranteesResult, pieceTypesResult, stoneOptionsResult, caratOptionsResult, metalOptionsResult] = await Promise.all([
    supabase.from('bespoke_hero_content').select('badge_text, eyebrow, heading_line_1, heading_line_2, subtitle, primary_cta_label, secondary_cta_label, secondary_cta_action, slider_enabled').eq('status', 'active').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('bespoke_hero_slider_items').select('sort_order, image_path, mobile_image_path, button_text, button_link').order('sort_order', { ascending: true }),
    supabase.from('bespoke_process_cards').select('id, sort_order, eyebrow, title, description').order('sort_order', { ascending: true }),
    supabase.from('bespoke_portfolio_categories').select('id, name, slug, display_order').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('bespoke_portfolio_items').select('id, title, tag, category_id, media_type, media_path, thumbnail_path, gem_style, gem_color, dark_theme, short_description, display_order').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('bespoke_process_steps').select('id, sort_order, step, eyebrow, title, description, image_path').order('sort_order', { ascending: true }),
    supabase.from('bespoke_form_settings').select('*').eq('status', 'active').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('bespoke_form_guarantees').select('id, label, display_order').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('bespoke_form_piece_types').select('id, label, display_order').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('bespoke_form_stone_options').select('id, label, display_order').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('bespoke_form_carat_options').select('id, label, display_order').eq('status', 'active').order('display_order', { ascending: true }),
    supabase.from('bespoke_form_metal_options').select('id, label, display_order').eq('status', 'active').order('display_order', { ascending: true }),
  ]);

  const portfolioCategories = categoriesResult.data ?? [];
  const categoryMap = new Map(portfolioCategories.map((category) => [category.id, category]));
  const portfolioItems = (portfolioItemsResult.data ?? [])
    .map((item: any) => ({
      ...item,
      category: categoryMap.get(item.category_id) ?? null,
      media_url: buildPublicUrl(item.media_path),
      thumbnail_url: buildPublicUrl(item.thumbnail_path),
    }))
    .filter((item: any) => item.category);

  const manufacturingItems = (manufacturingResult.data ?? []).map((item: any) => ({
    ...item,
    image_url: buildPublicUrl(item.image_path),
  }));

  const formConfig = {
    settings: {
      intro_heading: settingsResult.data?.intro_heading ?? 'Configure Your Bespoke Order',
      intro_subtitle: settingsResult.data?.intro_subtitle ?? 'Every bespoke commission begins with a conversation. Share your vision below and our team will be in touch within 24 hours with next steps.',
      footer_note: settingsResult.data?.footer_note ?? "We'll reply within 24 hours. Your details stay confidential.",
    },
    guarantees: guaranteesResult.data ?? [],
    pieceTypes: pieceTypesResult.data ?? [],
    stoneOptions: stoneOptionsResult.data ?? [],
    caratOptions: caratOptionsResult.data ?? [],
    metalOptions: metalOptionsResult.data ?? [],
  };

  return (
    <BespokeClient
      hero={heroResult.data ?? null}
      slides={slidesResult.data ?? []}
      processItems={processResult.data ?? []}
      portfolioCategories={portfolioCategories}
      portfolioItems={portfolioItems}
      manufacturingItems={manufacturingItems}
      formConfig={formConfig}
    />
  );
}
