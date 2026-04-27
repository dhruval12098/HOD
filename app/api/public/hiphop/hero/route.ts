import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const sectionKey = 'hiphop_hero'

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data: section, error } = await supabase
    .from('hiphop_hero_content')
    .select('*')
    .eq('section_key', sectionKey)
    .eq('is_active', true)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!section) return NextResponse.json({ item: null, items: [] })

  const { data: items, error: itemsError } = await supabase
    .from('hiphop_hero_slider_items')
    .select('id, sort_order, image_path, mobile_image_path, button_text, button_link')
    .eq('hero_id', section.id)
    .order('sort_order', { ascending: true })

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  return NextResponse.json({ item: section, items: items ?? [] })
}
