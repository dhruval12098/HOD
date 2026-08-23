import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables for the frontend app.')
}

const createBrowserClient = () => createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>
const browserGlobal = typeof window === 'undefined'
  ? null
  : globalThis as typeof globalThis & { __houseOfDiamsSupabase?: BrowserSupabaseClient }

// Preserve one auth client across React Strict Mode and Turbopack hot reloads.
// Multiple clients can each start token recovery and exhaust the Auth refresh limit.
export const supabase = browserGlobal?.__houseOfDiamsSupabase ?? createBrowserClient()
if (browserGlobal) browserGlobal.__houseOfDiamsSupabase = supabase
