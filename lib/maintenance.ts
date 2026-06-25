const settingsKey = 'global_site_settings'

export const fallbackMaintenanceMessage =
  'Our atelier is receiving a careful polish. House of Diams will be back online shortly.'

export type MaintenanceModeState = {
  enabled: boolean
  message: string
}

export async function getMaintenanceMode(): Promise<MaintenanceModeState> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return { enabled: false, message: fallbackMaintenanceMessage }
  }

  const url = new URL('/rest/v1/site_settings', supabaseUrl)
  url.searchParams.set('settings_key', `eq.${settingsKey}`)
  url.searchParams.set('select', 'maintenance_mode_enabled,maintenance_mode_message')
  url.searchParams.set('limit', '1')

  try {
    const response = await fetch(url, {
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return { enabled: false, message: fallbackMaintenanceMessage }
    }

    const rows = await response.json()
    const settings = Array.isArray(rows) ? rows[0] : null

    return {
      enabled: Boolean(settings?.maintenance_mode_enabled),
      message:
        typeof settings?.maintenance_mode_message === 'string' && settings.maintenance_mode_message.trim()
          ? settings.maintenance_mode_message.trim()
          : fallbackMaintenanceMessage,
    }
  } catch {
    return { enabled: false, message: fallbackMaintenanceMessage }
  }
}
