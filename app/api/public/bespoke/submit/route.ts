import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (
    !body ||
    typeof body.full_name !== 'string' ||
    typeof body.email !== 'string' ||
    typeof body.country !== 'string' ||
    typeof body.piece_type !== 'string' ||
    typeof body.message !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { error } = await supabase.from('bespoke_submissions').insert({
    full_name: body.full_name.trim(),
    email: body.email.trim(),
    phone: typeof body.phone === 'string' ? body.phone.trim() : '',
    country: body.country.trim(),
    piece_type: body.piece_type.trim(),
    stone_preference: typeof body.stone_preference === 'string' ? body.stone_preference.trim() : '',
    approx_carat: typeof body.approx_carat === 'string' ? body.approx_carat.trim() : '',
    preferred_metal: typeof body.preferred_metal === 'string' ? body.preferred_metal.trim() : '',
    message: body.message.trim(),
    status: 'new',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
