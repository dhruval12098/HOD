import MaintenanceScreen from '@/components/layout/MaintenanceScreen'
import { fallbackMaintenanceMessage } from '@/lib/maintenance'

export const dynamic = 'force-dynamic'

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
