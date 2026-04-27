import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const { data, error } = await supabase
    .from('diamond_info_sections')
    .select('sort_order, label, heading, paragraph')
    .order('sort_order', { ascending: true })

  const { data: config, error: configError } = await supabase
    .from('diamond_info_config')
    .select('video_enabled, video_path, video_poster_path')
    .eq('section_key', 'home_diamond_info')
    .maybeSingle()

  const isMissingConfigTable =
    configError?.code === 'PGRST205' ||
    configError?.message?.includes("Could not find the table 'public.diamond_info_config'")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (configError && !isMissingConfigTable) {
    return NextResponse.json({ error: configError.message }, { status: 500 })
  }

  return NextResponse.json({
    items: data ?? [],
    config: {
      video_enabled: isMissingConfigTable ? false : (config?.video_enabled ?? false),
      video_path: isMissingConfigTable ? '' : (config?.video_path ?? ''),
      video_poster_path: isMissingConfigTable ? '' : (config?.video_poster_path ?? ''),
    },
  })
}
