import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function isMissingRelationError(error: { code?: string; message?: string } | null) {
  return error?.code === 'PGRST205' || error?.message?.includes('schema cache') || error?.message?.includes('does not exist')
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 })
  }

  const email = body.email.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { error } = await supabase.from('newsletter_submissions').insert({
    email,
    source: 'homepage_newsletter',
    status: 'new',
  })

  if (error) {
    if (isMissingRelationError(error)) {
      return NextResponse.json({ error: 'Newsletter storage is not enabled yet.' }, { status: 503 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
