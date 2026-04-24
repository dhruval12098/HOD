import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const sectionKey = 'home_testimonials'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const { data: section, error: sectionError } = await supabase
    .from('testimonials_section')
    .select('id, eyebrow, heading')
    .eq('section_key', sectionKey)
    .maybeSingle()

  if (sectionError) {
    return NextResponse.json({ error: sectionError.message }, { status: 500 })
  }

  if (!section) {
    return NextResponse.json({
      eyebrow: 'Client Stories',
      heading: 'What Our Clients Say',
      items: [],
    })
  }

  const { data: items, error: itemsError } = await supabase
    .from('testimonials_items')
    .select('sort_order, quote, author, origin, rating')
    .eq('section_id', section.id)
    .order('sort_order', { ascending: true })

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  return NextResponse.json({
    eyebrow: section.eyebrow,
    heading: section.heading,
    items: items ?? [],
  })
}
