import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { enforceRateLimit } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9][0-9\s\-()]{7,19}$/

function isValidEmail(value: string) {
  return EMAIL_RE.test(value)
}

function isValidPhone(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return true
  const digitsOnly = trimmed.replace(/\D/g, '')
  return PHONE_RE.test(trimmed) && digitsOnly.length >= 8
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  const rateLimit = await enforceRateLimit(request, { key: 'public-contact-submit', limit: 5, windowSeconds: 60 })
  if (!rateLimit.ok && rateLimit.response) return rateLimit.response
  const body = await request.json().catch(() => null)
  if (!body || typeof body.full_name !== 'string' || typeof body.email !== 'string' || typeof body.topic !== 'string' || typeof body.message !== 'string') {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 })
  }

  const fullName = body.full_name.trim()
  const email = body.email.trim().toLowerCase()
  const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
  const topic = body.topic.trim()
  const message = body.message.trim()

  if (!fullName || fullName.length > 120) {
    return NextResponse.json({ error: 'Enter a valid name.' }, { status: 400 })
  }

  if (!email || email.length > 254 || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: 'Enter a valid phone number.' }, { status: 400 })
  }

  if (!topic || topic.length > 120) {
    return NextResponse.json({ error: 'Enter a valid subject.' }, { status: 400 })
  }

  if (!message || message.length < 10 || message.length > 5000) {
    return NextResponse.json({ error: 'Enter a message between 10 and 5000 characters.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { error } = await supabase.from('contact_submissions').insert({
    full_name: fullName,
    email,
    phone,
    topic,
    message,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
