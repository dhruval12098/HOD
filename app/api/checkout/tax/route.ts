import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server-supabase'

const MAX_BATCH_SLUGS = 50

type TaxInfo = {
  gstLabel: string
  gstPercentage: number
}

const defaultTaxInfo: TaxInfo = {
  gstLabel: 'Taxes',
  gstPercentage: 0,
}

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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { slugs?: unknown } | null
  if (!Array.isArray(body?.slugs) || body.slugs.length === 0 || body.slugs.length > MAX_BATCH_SLUGS) {
    return NextResponse.json({ error: `Provide between 1 and ${MAX_BATCH_SLUGS} product slugs.` }, { status: 400 })
  }

  if (body.slugs.some((slug) => typeof slug !== 'string' || !slug.trim() || slug.length > 200)) {
    return NextResponse.json({ error: 'Every product slug must be a non-empty string.' }, { status: 400 })
  }

  const slugs = [...new Set(body.slugs.map((slug) => (slug as string).trim()))]
  const supabase = createSupabaseServerClient()
  const { data: products } = await supabase
    .from('products')
    .select('slug, gst_slab_id')
    .in('slug', slugs)

  const productsBySlug = new Map((products ?? []).map((product) => [product.slug, product]))
  const needsDefaultSlab = slugs.some((slug) => !productsBySlug.get(slug)?.gst_slab_id)
  let defaultGstSlabId: string | null = null

  if (needsDefaultSlab) {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('default_gst_slab_id')
      .eq('settings_key', 'global_site_settings')
      .maybeSingle()
    defaultGstSlabId = settings?.default_gst_slab_id ?? null
  }

  const slabIds = [...new Set(
    slugs
      .map((slug) => productsBySlug.get(slug)?.gst_slab_id ?? defaultGstSlabId)
      .filter((id): id is string => Boolean(id))
  )]
  const { data: slabs } = slabIds.length
    ? await supabase.from('catalog_gst_slabs').select('id, name, percentage').in('id', slabIds)
    : { data: [] }
  const slabsById = new Map((slabs ?? []).map((slab) => [slab.id, slab]))

  const needsFallbackSlab = slugs.some((slug) => {
    const slabId = productsBySlug.get(slug)?.gst_slab_id ?? defaultGstSlabId
    return !slabId || !slabsById.has(slabId)
  })
  const { data: fallbackSlab } = needsFallbackSlab
    ? await supabase
        .from('catalog_gst_slabs')
        .select('name, percentage')
        .neq('status', 'hidden')
        .order('display_order', { ascending: true })
        .limit(1)
        .maybeSingle()
    : { data: null }

  const taxBySlug = Object.fromEntries(
    slugs.map((slug) => {
      const slabId = productsBySlug.get(slug)?.gst_slab_id ?? defaultGstSlabId
      const slab = (slabId ? slabsById.get(slabId) : null) ?? fallbackSlab
      return [
        slug,
        slab
          ? { gstLabel: slab.name || 'Taxes', gstPercentage: Number(slab.percentage || 0) }
          : defaultTaxInfo,
      ]
    })
  )

  return NextResponse.json({ taxBySlug })
}
