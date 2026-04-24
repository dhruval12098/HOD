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
  const { data, error } = await supabase
    .from('hiphop_showcase_section')
    .select('eyebrow, heading_line_1, heading_line_2, heading_emphasis, cta_label, cta_link, image_path, image_alt')
    .eq('section_key', 'home_hiphop_showcase')
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    section: data ?? {
      eyebrow: 'Hip Hop Collection · House of Diams',
      heading_line_1: 'Ice That',
      heading_line_2: 'Speaks',
      heading_emphasis: 'Louder.',
      cta_label: 'Shop Iced Pieces',
      cta_link: '/hiphop',
      image_path: '',
      image_alt: 'House of Diams Hip Hop Collection',
    },
  })
}
