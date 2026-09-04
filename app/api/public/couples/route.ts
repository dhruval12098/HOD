import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const sectionKey = 'home_couples'

export const dynamic = 'force-static'
export const revalidate = 300

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data: section, error: sectionError } = await supabase
    .from('couples_section')
    .select('id, eyebrow, heading, subtitle')
    .eq('section_key', sectionKey)
    .maybeSingle()
  if (sectionError) return NextResponse.json({ error: sectionError.message }, { status: 500 })

  if (!section) {
    return NextResponse.json({ eyebrow: 'Love Stories', heading: 'Our Cute Couples', subtitle: 'Real couples. Real proposals. Real diamonds.', items: [] })
  }

  const { data: items, error: itemsError } = await supabase
    .from('couples_items')
    .select('sort_order, names, location, story, product_name, product_link, product_detail, image_path')
    .eq('section_id', section.id)
    .order('sort_order', { ascending: true })
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  return NextResponse.json({
    eyebrow: section.eyebrow,
    heading: section.heading,
    subtitle: section.subtitle,
    items: items ?? [],
  })
}
