import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  const body = await request.json().catch(() => null)
  if (!body || typeof body.full_name !== 'string' || typeof body.email !== 'string' || typeof body.topic !== 'string' || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 })
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { error } = await supabase.from('contact_submissions').insert({
    full_name: body.full_name,
    email: body.email,
    phone: typeof body.phone === 'string' ? body.phone : '',
    topic: body.topic,
    message: body.message,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
