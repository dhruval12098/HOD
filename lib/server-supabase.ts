import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || (!supabaseServiceRoleKey && !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables for the frontend app.')
}

export function createSupabaseServerClient() {
  return createClient(supabaseUrl!, supabaseServiceRoleKey || supabaseAnonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
