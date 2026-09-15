import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const SECTION_KEY = 'global_support_announcement_bar'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

type AnnouncementItem = {
  message: string
  linkUrl: string
  openInNewTab: boolean
}

type AnnouncementPayload = {
  active: boolean
  item: AnnouncementItem | null
}

function getServerClient() {
  const serverKey = supabaseServiceRoleKey || supabaseAnonKey
  if (!supabaseUrl || !serverKey) return null

  return createClient(supabaseUrl, serverKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function GET() {
  const supabase = getServerClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Missing Supabase environment variables.' }, { status: 500 })
  }

  const { data: section, error: sectionError } = await supabase
    .from('support_announcement_bar')
    .select('id, is_active')
    .eq('section_key', SECTION_KEY)
    .maybeSingle()

  if (sectionError) {
    return NextResponse.json({ error: sectionError.message }, { status: 500 })
  }

  if (!section) {
    const payload: AnnouncementPayload = { active: false, item: null }
    return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
  }

  const { data: item, error: itemError } = await supabase
    .from('support_announcement_bar_items')
    .select('message, link_url, open_in_new_tab')
    .eq('bar_id', section.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 })
  }

  const payload: AnnouncementPayload = {
    active: Boolean(section.is_active),
    item: item
      ? {
          message: item.message,
          linkUrl: item.link_url ?? '',
          openInNewTab: Boolean(item.open_in_new_tab),
        }
      : null,
  }

  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } })
}
