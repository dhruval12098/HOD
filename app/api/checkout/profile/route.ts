import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization token.' }, { status: 401 })
  }

  const accessToken = authHeader.slice('Bearer '.length)
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey)

  const { data: userData, error: userError } = await authClient.auth.getUser()
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('email, first_name, last_name, phone, country, state, city, postal_code, address_line_1, address_line_2')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({
    profile: {
      email: profile?.email || userData.user.email || '',
      first_name: profile?.first_name || userData.user.user_metadata?.first_name || '',
      last_name: profile?.last_name || userData.user.user_metadata?.last_name || '',
      phone: profile?.phone || userData.user.user_metadata?.phone || '',
      country: profile?.country || '',
      state: profile?.state || '',
      city: profile?.city || '',
      postal_code: profile?.postal_code || '',
      address_line_1: profile?.address_line_1 || '',
      address_line_2: profile?.address_line_2 || '',
    },
  })
}
