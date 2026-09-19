import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const bucket = process.env.SUPABASE_COLLECTION_BUCKET ?? process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod'
export const dynamic = 'force-static'
export const revalidate = 300

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase.from('about_wide_banner').select('is_enabled, desktop_image_path, mobile_image_path, image_alt, heading, paragraph, show_button, button_label, button_link, content_position, sort_order').eq('section_key', 'about_wide_banner').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const url = (path?: string | null) => !path ? '' : /^https?:\/\//i.test(path) ? path : `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  return NextResponse.json(data ? { ...data, desktop_image_url: url(data.desktop_image_path), mobile_image_url: url(data.mobile_image_path || data.desktop_image_path) } : null)
}
