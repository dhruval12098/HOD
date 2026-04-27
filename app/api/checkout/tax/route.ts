import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ gstLabel: 'Taxes', gstPercentage: 0 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
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
