import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const sectionKey = 'home_testimonial_marquee'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const { data: marquee, error: marqueeError } = await supabase
    .from('testimonial_marquee')
    .select('id, title')
    .eq('section_key', sectionKey)
    .maybeSingle()

  if (marqueeError) {
    return NextResponse.json({ error: marqueeError.message }, { status: 500 })
  }

  if (!marquee) {
    return NextResponse.json({
      title: 'Loved by Clients Worldwide',
      items: [],
    })
  }

  const { data: items, error: itemsError } = await supabase
    .from('testimonial_marquee_items')
    .select('id, sort_order, quote, author')
    .eq('marquee_id', marquee.id)
    .order('sort_order', { ascending: true })

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  return NextResponse.json({
    title: marquee.title,
    items: items ?? [],
  })
}
