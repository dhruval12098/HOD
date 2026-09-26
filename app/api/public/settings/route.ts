import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars.' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const primaryResult = await supabase
    .from('site_settings')
    .select('whatsapp_number, maintenance_mode_enabled, maintenance_mode_message, estimated_delivery_text')
    .eq('settings_key', 'global_site_settings')
    .maybeSingle()

  let data: {
    whatsapp_number?: string | null
    maintenance_mode_enabled?: boolean | null
    maintenance_mode_message?: string | null
    estimated_delivery_text?: string | null
  } | null = primaryResult.data
  let error = primaryResult.error
  let estimatedDeliveryText = data?.estimated_delivery_text ?? 'Approximately 3 to 4 weeks'

  // Keep existing settings usable until the new migration has been applied.
  if (error?.message?.toLowerCase().includes('estimated_delivery_text')) {
    const fallbackResult = await supabase
      .from('site_settings')
      .select('whatsapp_number, maintenance_mode_enabled, maintenance_mode_message')
      .eq('settings_key', 'global_site_settings')
      .maybeSingle()
    data = fallbackResult.data
    error = fallbackResult.error
    estimatedDeliveryText = 'Approximately 3 to 4 weeks'
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    item: {
      whatsapp_number: data?.whatsapp_number ?? '',
      maintenance_mode_enabled: Boolean(data?.maintenance_mode_enabled),
      maintenance_mode_message: data?.maintenance_mode_message ?? '',
      estimated_delivery_text: estimatedDeliveryText,
    },
  })
}
