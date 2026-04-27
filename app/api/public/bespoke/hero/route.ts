import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function isMissingSliderEnabledColumn(message?: string) {
  return Boolean(message?.includes("slider_enabled"))
}

export async function GET() {
  if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceRoleKey)) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey!)
  const sectionSelectWithToggle = 'id, badge_text, eyebrow, heading_line_1, heading_line_2, subtitle, primary_cta_label, primary_cta_action, secondary_cta_label, secondary_cta_action, slider_enabled, status, updated_at'
  const sectionSelectFallback = 'id, badge_text, eyebrow, heading_line_1, heading_line_2, subtitle, primary_cta_label, primary_cta_action, secondary_cta_label, secondary_cta_action, status, updated_at'

  let { data: sections, error }: { data: any[] | null; error: { message?: string } | null } = await supabase
    .from('bespoke_hero_content')
    .select(sectionSelectWithToggle)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(1)

  const hasSliderColumn = !isMissingSliderEnabledColumn(error?.message)
  if (error && !hasSliderColumn) {
    const fallbackResult = await supabase
      .from('bespoke_hero_content')
      .select(sectionSelectFallback)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
    sections = fallbackResult.data
    error = fallbackResult.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const section = sections?.[0] ?? null
  if (!section) return NextResponse.json({ item: null, items: [] })

  const { data: items, error: itemsError } = await supabase
    .from('bespoke_hero_slider_items')
    .select('id, sort_order, image_path, mobile_image_path, button_text, button_link')
    .eq('hero_id', section.id)
    .order('sort_order', { ascending: true })

  const safeItemsError = itemsError?.message?.includes("Could not find the table 'public.bespoke_hero_slider_items'")
  if (itemsError && !safeItemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  const safeItems = safeItemsError ? [] : (items ?? [])

  return NextResponse.json({
    item: {
      badge_text: section.badge_text ?? '',
      eyebrow: section.eyebrow ?? '',
      heading_line_1: section.heading_line_1 ?? '',
      heading_line_2: section.heading_line_2 ?? '',
      subtitle: section.subtitle ?? '',
      primary_cta_label: section.primary_cta_label ?? '',
      primary_cta_action: section.primary_cta_action ?? '',
      secondary_cta_label: section.secondary_cta_label ?? '',
      secondary_cta_action: section.secondary_cta_action ?? '',
      slider_enabled: hasSliderColumn ? Boolean(section.slider_enabled) : safeItems.some((item) => item.image_path?.trim()),
      status: section.status,
    },
    items: safeItems,
  })
}
