import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod'
export const dynamic = 'force-static'
export const revalidate = 300

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase.from('about_hero')
    .select('is_enabled, media_type, desktop_media_path, mobile_media_path, video_poster_path, media_alt, show_text_overlay, heading, paragraph, show_button, button_label, button_link, overlay_position, overlay_scrim_enabled')
    .eq('section_key', 'about_hero').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const url = (path?: string | null) => !path ? '' : /^https?:\/\//i.test(path) ? path : `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  return NextResponse.json(data ? { ...data, desktop_media_url: url(data.desktop_media_path), mobile_media_url: url(data.mobile_media_path || data.desktop_media_path), video_poster_url: url(data.video_poster_path) } : null)
}
