import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const PROFILE_FIELDS = 'email, first_name, last_name, phone, birth_date, anniversary_date, country, state, district, city, postal_code, address_line_1, address_line_2'

async function getAuthenticatedClients(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) return { error: 'Missing Supabase environment variables.', status: 500 as const }
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return { error: 'Missing authorization token.', status: 401 as const }
  const authClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } })
  const { data, error } = await authClient.auth.getUser()
  if (error || !data.user) return { error: 'Unauthorized.', status: 401 as const }
  return { user: data.user, adminClient: createClient(supabaseUrl, supabaseServiceRoleKey) }
}

function optionalText(value: unknown, label: string, maxLength: number) {
  if (value == null) return { value: null }
  if (typeof value !== 'string') return { error: `${label} must be text.` }
  const normalized = value.trim()
  if (normalized.length > maxLength) return { error: `${label} must be ${maxLength} characters or fewer.` }
  return { value: normalized || null }
}

function optionalDate(value: unknown, label: string) {
  if (value == null || value === '') return { value: null }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { error: `${label} must be a valid date.` }
  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return { error: `${label} must be a valid date.` }
  return { value }
}

export async function GET(request: Request) {
  const access = await getAuthenticatedClients(request)
  if ('error' in access) return NextResponse.json({ error: access.error }, { status: access.status })
  const { data, error } = await access.adminClient.from('profiles').select(PROFILE_FIELDS).eq('id', access.user.id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: { ...data, email: data?.email || access.user.email || '' } })
}

export async function PATCH(request: Request) {
  const access = await getAuthenticatedClients(request)
  if ('error' in access) return NextResponse.json({ error: access.error }, { status: access.status })
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid profile payload.' }, { status: 400 })

  const specs = [
    ['first_name', 'First name', 80], ['last_name', 'Last name', 80], ['phone', 'Phone', 40],
    ['country', 'Country', 100], ['state', 'State', 100], ['district', 'District', 100], ['city', 'City', 100],
    ['postal_code', 'Postal code', 24], ['address_line_1', 'Address line 1', 200], ['address_line_2', 'Address line 2', 200],
  ] as const
  const update: Record<string, string | null> = {}
  for (const [key, label, maxLength] of specs) {
    const result = optionalText(body[key], label, maxLength)
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 })
    update[key] = result.value ?? null
  }
  for (const [key, label] of [['birth_date', 'Birth date'], ['anniversary_date', 'Anniversary date']] as const) {
    const result = optionalDate(body[key], label)
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 })
    update[key] = result.value ?? null
  }
  if (update.birth_date && update.birth_date > new Date().toISOString().slice(0, 10)) {
    return NextResponse.json({ error: 'Birth date cannot be in the future.' }, { status: 400 })
  }

  const { data, error } = await access.adminClient
    .from('profiles')
    .upsert({ id: access.user.id, email: access.user.email || null, ...update, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select(PROFILE_FIELDS)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}