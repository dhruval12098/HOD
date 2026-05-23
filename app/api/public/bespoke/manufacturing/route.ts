import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase.from('bespoke_process_steps').select('id, sort_order, step, eyebrow, title, description, image_path, media_type, media_path').order('sort_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod'
  const toPublicUrl = (path?: string | null) => {
    if (!path) return ''
    if (/^https?:\/\//i.test(path)) return path
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  }
  const items = (data ?? []).map((item) => ({
    ...item,
    media_type: item.media_type === 'video' ? 'video' : 'image',
    media_path: item.media_path || item.image_path || '',
    media_url: toPublicUrl(item.media_path || item.image_path),
    image_url: toPublicUrl(item.image_path),
  }))
  return NextResponse.json({ items })
}
