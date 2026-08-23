import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceRoleKey)) {
  throw new Error('Missing Supabase environment variables for the frontend app.')
}

export function createSupabaseServerClient() {
  if (!supabaseServiceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set — falling back to anon key. This may break RLS-dependent queries.')
  }

  return createClient(supabaseUrl!, supabaseServiceRoleKey || supabaseAnonKey!, {
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  })
}
