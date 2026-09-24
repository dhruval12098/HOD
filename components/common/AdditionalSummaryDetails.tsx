'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

type SummaryPointer = {
  id: string
  icon_url: string | null
  pointer_text: string
  video_url: string | null
  video_link_text: string | null
}

export default function AdditionalSummaryDetails() {
  const [summary, setSummary] = useState<{ heading: string; pointers: SummaryPointer[] } | null>(null)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  useEffect(() => {
    if (!url || !anonKey) return
    let cancelled = false
    const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    void (async () => {
      const { data: section, error } = await client.from('cms_summary_sections').select('id, heading').eq('section_key', 'additional_summary_details').eq('is_enabled', true).maybeSingle()
      if (cancelled || error || !section) return
      const { data, error: pointerError } = await client.from('cms_summary_pointers').select('id, icon_url, pointer_text, video_url, video_link_text').eq('section_id', section.id).order('sort_order').order('created_at')
      if (!cancelled && !pointerError && data?.length) setSummary({ heading: section.heading, pointers: data as SummaryPointer[] })
    })()
    return () => { cancelled = true }
  }, [url, anonKey])

  if (!summary) return null

  return <>
    <section aria-label={summary.heading} className="-mt-px w-full border border-black/10 bg-white px-5 py-5 text-black">
      <h2 className="font-[family-name:var(--font-family-primary)] text-[20px] font-semibold leading-tight text-black">{summary.heading}</h2>
      <ul className="mt-4 space-y-4">
        {summary.pointers.map((point) => <li key={point.id} className="flex items-start gap-3 text-[16px] font-medium leading-6 text-black">
          {point.icon_url ? <img src={point.icon_url} alt="" className="mt-0.5 h-8 w-8 shrink-0 object-contain" /> : <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-black" />}
          <div className="font-[family-name:var(--font-family-inter)] text-[16px] font-medium leading-6 text-black"><span>{point.pointer_text}</span>{point.video_url && <div><a href={point.video_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 font-[family-name:var(--font-family-inter)] text-[15px] font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800"><span aria-hidden="true">▶</span>{point.video_link_text || 'Watch video'}</a></div>}</div>
        </li>)}
      </ul>
    </section>
  </>
}
