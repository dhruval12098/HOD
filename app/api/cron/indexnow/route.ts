import { submitCurrentSitemapToIndexNow } from '@/lib/indexnow'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const result = await submitCurrentSitemapToIndexNow()
    return Response.json({ ok: true, ...result })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'IndexNow submission failed.' },
      { status: 502 }
    )
  }
}
