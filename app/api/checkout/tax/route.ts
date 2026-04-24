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

  if (!product?.gst_slab_id) {
    return NextResponse.json({ gstLabel: 'Taxes', gstPercentage: 0 })
  }

  const { data: slab } = await supabase
    .from('catalog_gst_slabs')
    .select('name, percentage')
    .eq('id', product.gst_slab_id)
    .maybeSingle()

  return NextResponse.json({
    gstLabel: slab?.name || 'Taxes',
    gstPercentage: Number(slab?.percentage || 0),
  })
}
