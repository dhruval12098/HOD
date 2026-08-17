import { buildLlmsText } from '@/lib/ai-discovery'

export const dynamic = 'force-dynamic'

export async function GET() {
  return new Response(await buildLlmsText(false), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
