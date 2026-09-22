'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import type { StorefrontProduct } from '@/lib/catalog-products'

export default function BlogFeaturedProjects({ products }: { products: StorefrontProduct[] }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const items = products.slice(0, 4)
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKey) }
  }, [open])
  if (!items.length) return null
  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label="Show featured projects" className="group absolute bottom-5 left-5 z-10 flex h-11 w-11 items-center justify-start overflow-hidden rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,.16)] transition-[width] duration-300 hover:w-[205px] focus-visible:w-[205px]">
      <span className="grid h-11 w-11 shrink-0 place-items-center"><img src="/Navbar svgs/handbag-simple.svg" alt="" className="h-5 w-5" /></span><span className="whitespace-nowrap pr-5 font-[family-name:var(--font-family-montserrat)] text-[10px] font-semibold uppercase tracking-[.08em] text-black opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">Show featured projects</span>
    </button>
    <div className={`fixed inset-0 z-[3000] transition-[visibility] duration-300 ${open ? 'visible' : 'invisible'}`} aria-hidden={!open}>
      <button type="button" aria-label="Close featured projects" onClick={() => setOpen(false)} className={`absolute inset-0 h-full w-full bg-black/25 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <aside ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="featured-projects-title" className={`absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-white shadow-[-16px_0_42px_rgba(0,0,0,.16)] transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <header className="flex h-14 items-center justify-between border-b border-black/15 px-5"><h2 id="featured-projects-title" className="font-[family-name:var(--font-family-montserrat)] text-[14px] font-semibold uppercase tracking-[.07em] text-black">Featured Projects</h2><button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center text-black hover:bg-black hover:text-white"><X size={19} strokeWidth={1.4} /></button></header>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-5">{items.map((product) => <Link key={product.dbId || product.slug} href={`/shop/${product.slug}`} onClick={() => setOpen(false)} className="group min-w-0 no-underline"><div className="aspect-square overflow-hidden bg-[#f6f6f6]">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : null}</div><p className="mt-2 truncate font-[family-name:var(--font-family-montserrat)] text-[11px] font-semibold text-black">{product.name}</p><p className="mt-1 text-[11px] text-black/60">{product.shortMeta}</p></Link>)}</div>
      </aside>
    </div>
  </>
}
