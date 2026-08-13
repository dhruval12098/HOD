import type { Metadata } from 'next'
import MaintenanceScreen from '@/components/layout/MaintenanceScreen'
import { fallbackMaintenanceMessage } from '@/lib/maintenance'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Maintenance',
  robots: { index: false, follow: false },
}

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams
  const message = typeof params.message === 'string' && params.message.trim()
    ? params.message.trim()
    : fallbackMaintenanceMessage

  return <MaintenanceScreen message={message} />
}
