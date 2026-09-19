import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server-supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createSupabaseServerClient()
  const [{ data: section, error: sectionError }, { data: blocks, error: blocksError }] = await Promise.all([
    supabase
      .from('service_banner_section')
      .select('image_path, image_alt')
      .eq('id', 1)
      .eq('is_enabled', true)
      .maybeSingle(),
    supabase
      .from('service_banner_blocks')
      .select('id, title, paragraph, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
  ])

  if (sectionError || blocksError) {
    return NextResponse.json({ error: sectionError?.message ?? blocksError?.message ?? 'Unable to load service banner.' }, { status: 500 })
  }

  if (!section?.image_path || !blocks?.length) {
    return NextResponse.json({ section: null, blocks: [] }, { headers: { 'Cache-Control': 'no-store' } })
  }

  const imageUrl = supabase.storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET || 'hod')
    .getPublicUrl(section.image_path).data.publicUrl

  return NextResponse.json(
    {
      section: { imageUrl, imageAlt: section.image_alt ?? '' },
      blocks,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}