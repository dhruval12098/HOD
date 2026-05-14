import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'

function toPublicUrl(path?: string | null) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod'
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

export async function GET() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const [{ data: features, error: featuresError }, { data: config, error: configError }] = await Promise.all([
    supabase
      .from('diamond_info_feature_items')
      .select('id, sort_order, icon_svg, title, description, is_active')
      .eq('section_key', 'home_diamond_info')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('diamond_info_config')
      .select('video_enabled, video_path, video_poster_path, layout_mode, eyebrow, section_heading, section_subtext, cta_label, cta_link')
      .eq('section_key', 'home_diamond_info')
      .maybeSingle(),
  ])

  const isMissingConfigTable =
    configError?.code === 'PGRST205' ||
    configError?.message?.includes("Could not find the table 'public.diamond_info_config'")

  const isMissingFeatureTable =
    featuresError?.code === 'PGRST205' ||
    featuresError?.message?.includes("Could not find the table 'public.diamond_info_feature_items'")

  if (featuresError && !isMissingFeatureTable) {
    return NextResponse.json({ error: featuresError.message }, { status: 500 })
  }

  if (configError && !isMissingConfigTable) {
    return NextResponse.json({ error: configError.message }, { status: 500 })
  }

  return NextResponse.json({
    items: isMissingFeatureTable
      ? []
      : (features ?? []).map((item) => ({
          id: item.id,
          sort_order: item.sort_order,
          iconSvg: item.icon_svg ?? '',
          title: item.title ?? '',
          description: item.description ?? '',
          is_active: item.is_active ?? true,
        })),
    config: {
      videoEnabled: isMissingConfigTable ? false : (config?.video_enabled ?? false),
      videoUrl: isMissingConfigTable ? '' : toPublicUrl(config?.video_path),
      videoPosterUrl: isMissingConfigTable ? '' : toPublicUrl(config?.video_poster_path),
      layoutMode: isMissingConfigTable ? 'split_video_text' : (config?.layout_mode ?? 'split_video_text'),
      eyebrow: isMissingConfigTable ? '' : (config?.eyebrow ?? ''),
      sectionHeading: isMissingConfigTable ? '' : (config?.section_heading ?? ''),
      sectionSubtext: isMissingConfigTable ? '' : (config?.section_subtext ?? ''),
      ctaLabel: isMissingConfigTable ? '' : (config?.cta_label ?? ''),
      ctaLink: isMissingConfigTable ? '' : (config?.cta_link ?? ''),
    },
  })
}
