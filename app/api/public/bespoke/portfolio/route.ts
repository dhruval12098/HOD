import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const bucket = process.env.NEXT_PUBLIC_SUPABASE_COLLECTION_BUCKET ?? 'hod'

function buildPublicUrl(path: string | null) {
  if (!path || !supabaseUrl) return ''
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const [categoriesResult, itemsResult] = await Promise.all([
    supabase
      .from('bespoke_portfolio_categories')
      .select('id, name, slug, display_order')
      .eq('status', 'active')
      .order('display_order', { ascending: true }),
    supabase
      .from('bespoke_portfolio_items')
      .select('id, title, tag, category_id, media_type, media_path, thumbnail_path, gem_style, gem_color, dark_theme, short_description, display_order')
      .eq('status', 'active')
      .order('display_order', { ascending: true }),
  ])

  if (categoriesResult.error) {
    return NextResponse.json({ error: categoriesResult.error.message }, { status: 500 })
  }

  if (itemsResult.error) {
    return NextResponse.json({ error: itemsResult.error.message }, { status: 500 })
  }

  const categories = categoriesResult.data ?? []
  const categoryMap = new Map(categories.map((category) => [category.id, category]))
  const items = (itemsResult.data ?? [])
    .map((item: any) => ({
      ...item,
      category: categoryMap.get(item.category_id) ?? null,
      media_url: buildPublicUrl(item.media_path),
      thumbnail_url: buildPublicUrl(item.thumbnail_path),
    }))
    .filter((item: any) => item.category)

  return NextResponse.json({
    categories,
    items,
  })
}
