import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data, error } = await supabase.from('contact_hero').select('eyebrow, heading, subtitle').eq('section_key', 'contact_hero').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data ?? null })
}
