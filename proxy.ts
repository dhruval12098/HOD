import { NextResponse, type NextRequest } from 'next/server'
import { getMaintenanceMode } from '@/lib/maintenance'

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
