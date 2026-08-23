import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server-supabase'
import { enforceRateLimit } from '@/lib/rate-limit'
import { isValidEmail } from '@/lib/validation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
function isMissingRelationError(error: { code?: string; message?: string } | null) {
  return error?.code === 'PGRST205' || error?.message?.includes('schema cache') || error?.message?.includes('does not exist')
}

export async function POST(request: Request) {
  if (!supabaseUrl) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const rateLimit = await enforceRateLimit(request, { key: 'public-newsletter-submit', limit: 6, windowSeconds: 60 })
  if (!rateLimit.ok && rateLimit.response) return rateLimit.response

  const body = await request.json().catch(() => null)
  if (!body || typeof body.email !== 'string') {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 })
  }

  const email = body.email.trim().toLowerCase()
  if (!email || email.length > 254 || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
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
