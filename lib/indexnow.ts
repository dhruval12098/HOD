import sitemap from '@/app/sitemap'
import { getSiteUrl } from '@/lib/site-url'

export const INDEXNOW_KEY = 'a14f9c3e2b7d4a6886c5e1f902bd7431'

export async function submitCurrentSitemapToIndexNow() {
  const entries = await sitemap()
  const urlList = [...new Set(entries.map((entry) => entry.url).filter(Boolean))].slice(0, 10_000)
  const host = new URL(getSiteUrl()).host
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
    cache: 'no-store',
  })

  if (!response.ok && response.status !== 202) {
    throw new Error(`IndexNow returned HTTP ${response.status}.`)
  }

  return { submitted: urlList.length, status: response.status }
}
