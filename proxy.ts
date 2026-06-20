import { NextResponse, type NextRequest } from 'next/server'

const settingsKey = 'global_site_settings'
const fallbackMessage = 'Our atelier is receiving a careful polish. House of Diams will be back online shortly.'

async function getMaintenanceMode() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return { enabled: false, message: fallbackMessage }
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
      return { enabled: false, message: fallbackMessage }
    }

    const rows = await response.json()
    const settings = Array.isArray(rows) ? rows[0] : null

    return {
      enabled: Boolean(settings?.maintenance_mode_enabled),
      message: typeof settings?.maintenance_mode_message === 'string' && settings.maintenance_mode_message.trim()
        ? settings.maintenance_mode_message.trim()
        : fallbackMessage,
    }
  } catch {
    return { enabled: false, message: fallbackMessage }
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/maintenance') {
    return NextResponse.next()
  }

  const maintenanceMode = await getMaintenanceMode()
  if (!maintenanceMode.enabled) {
    return NextResponse.next()
  }

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = '/maintenance'
  rewriteUrl.searchParams.set('message', maintenanceMode.message)

  return NextResponse.rewrite(rewriteUrl)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|house-of-diams-favicon.ico|fonts|images|assets|.*\\..*).*)',
  ],
}
