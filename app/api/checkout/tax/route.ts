import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server-supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ gstLabel: 'Taxes', gstPercentage: 0 })
  }

  const supabase = createSupabaseServerClient()
  const { data: product } = await supabase.from('products').select('gst_slab_id').eq('slug', slug).maybeSingle()
  let gstSlabId = product?.gst_slab_id ?? null

  if (!gstSlabId) {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('*')
      .eq('settings_key', 'global_site_settings')
      .maybeSingle()

    gstSlabId = settings?.default_gst_slab_id ?? null
  }

  let slab = null
  if (gstSlabId) {
    const response = await supabase
      .from('catalog_gst_slabs')
      .select('name, percentage')
      .eq('id', gstSlabId)
      .maybeSingle()
    slab = response.data ?? null
  }

  if (!slab) {
    const fallbackResponse = await supabase
      .from('catalog_gst_slabs')
      .select('name, percentage')
      .neq('status', 'hidden')
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle()
    slab = fallbackResponse.data ?? null
  }

  return NextResponse.json({
    gstLabel: slab?.name || 'Taxes',
    gstPercentage: Number(slab?.percentage || 0),
  })
}
