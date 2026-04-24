import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const { data: section, error: sectionError } = await supabase
    .from('certifications_section')
    .select('section_key, eyebrow, heading')
    .eq('section_key', 'home_certifications')
    .maybeSingle()

  if (sectionError) return NextResponse.json({ error: sectionError.message }, { status: 500 })

  const { data: items, error: itemsError } = await supabase
    .from('certifications_items')
    .select('sort_order, title, description, badge, icon_path')
    .order('sort_order', { ascending: true })

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  return NextResponse.json({
    section: section ?? { section_key: 'home_certifications', eyebrow: 'Our Promise', heading: 'Why Choose House of Diams' },
    items: items ?? [],
  })
}
