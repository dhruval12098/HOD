import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const FORM_TABLES = [
  'bespoke_form_guarantees',
  'bespoke_form_piece_types',
  'bespoke_form_stone_options',
  'bespoke_form_carat_options',
  'bespoke_form_metal_options',
] as const

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const [settings, ...lists] = await Promise.all([
    supabase
      .from('bespoke_form_settings')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    ...FORM_TABLES.map((table) =>
      supabase.from(table).select('id, label, display_order').eq('status', 'active').order('display_order', { ascending: true })
    ),
  ])

  const error = settings.error || lists.find((result) => result.error)?.error
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    settings: settings.data,
    guarantees: lists[0].data ?? [],
    pieceTypes: lists[1].data ?? [],
    stoneOptions: lists[2].data ?? [],
    caratOptions: lists[3].data ?? [],
    metalOptions: lists[4].data ?? [],
  })
}
