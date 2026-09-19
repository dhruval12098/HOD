'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CalendarDays, CreditCard, MapPin, PackageCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const GUEST_CHECKOUT_TOKEN_KEY = 'hod_guest_checkout_token'
const FALLBACK_IMAGE = '/HOD%20specs/profile%20banner/wesfly-jzXYuYd-o00-unsplash.jpg'

type ResultState = 'success' | 'pending' | 'failed' | 'error'
type Item = { product_name: string; product_slug?: string | null; quantity: number; line_total: number; image_url?: string | null; selected_metal?: string | null; selected_purity?: string | null; selected_size_or_fit?: string | null; selected_gemstone?: string | null; selected_carat?: string | null; item_type?: string | null }
type Order = { order_number: string; created_at: string; customer_email?: string | null; customer_first_name?: string | null; customer_last_name?: string | null; customer_phone?: string | null; shipping_country?: string | null; shipping_state?: string | null; shipping_district?: string | null; shipping_city?: string | null; shipping_postal_code?: string | null; shipping_address_line_1?: string | null; shipping_address_line_2?: string | null; subtotal_amount: number; gst_amount: number; shipping_amount: number; total_amount: number; payment_gateway?: string | null; razorpay_payment_method?: string | null; items: Item[] }
type Payload = { state: ResultState; order: Order; cms?: { page?: { main_banner_image_url?: string; main_banner_image_alt?: string; secondary_banner_image_url?: string; secondary_banner_image_alt?: string; secondary_eyebrow?: string; secondary_heading?: string; secondary_paragraph?: string } | null; state?: { eyebrow?: string; heading?: string; paragraph?: string; order_button_label?: string } | null }; contact?: Array<{ id: string; label?: string; value?: string; note?: string; href?: string }>; categories?: Array<{ name: string; slug: string }> }

const copy: Record<ResultState, { eyebrow: string; heading: string; paragraph: string; button: string }> = {
  success: { eyebrow: 'Order confirmed', heading: 'A beautiful choice, now officially yours.', paragraph: 'Your order has been successfully placed and our team is preparing it with care.', button: 'View my order' },
  pending: { eyebrow: 'Payment confirmation pending', heading: 'We are confirming your order.', paragraph: 'Your payment status is still being confirmed. Please check again shortly.', button: 'View order status' },
  failed: { eyebrow: 'Payment unsuccessful', heading: 'Your order has not been completed.', paragraph: 'The payment was not completed. You can safely return to checkout and try again.', button: 'Return to checkout' },
  error: { eyebrow: 'Confirmation unavailable', heading: 'We could not confirm your order right now.', paragraph: 'Your payment may still be processing. Please check again shortly or contact our concierge.', button: 'Try again' },
}

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0))
const date = (value: string) => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value))

export default function CheckoutSuccessClient() {
  const searchParams = useSearchParams()
  const requestedOrder = searchParams.get('order')?.trim() || ''
  const [payload, setPayload] = useState<Payload | null>(null)
  const [state, setState] = useState<ResultState | 'loading'>('loading')
  const [guestOrder, setGuestOrder] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      if (!requestedOrder) { setState('error'); return }
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      const guestToken = token ? null : sessionStorage.getItem(GUEST_CHECKOUT_TOKEN_KEY)
      if (!token && !guestToken) { setState('error'); return }
      try {
        const response = await fetch(`/api/checkout/success?order=${encodeURIComponent(requestedOrder)}`, { cache: 'no-store', headers: token ? { authorization: `Bearer ${token}` } : { 'x-guest-checkout-token': guestToken! } })
        const result = await response.json().catch(() => null) as Payload | null
        if (!active) return
        if (!response.ok || !result?.order) { setState(response.status >= 500 ? 'error' : 'failed'); return }
        setPayload(result); setState(result.state); setGuestOrder(!token)
      } catch { if (active) setState('error') }
    }
    void load()
    return () => { active = false }
  }, [requestedOrder])

  if (state === 'loading') return <div className="flex min-h-[60vh] items-center justify-center bg-white font-[family-name:var(--font-family-secondary)] text-sm uppercase tracking-[0.18em] text-neutral-600">Confirming your order...</div>

  const fallback = copy[state]
  const cms = payload?.cms?.state
  const page = payload?.cms?.page
  const order = payload?.order
  const mainImage = page?.main_banner_image_url || FALLBACK_IMAGE
  const secondaryImage = page?.secondary_banner_image_url || FALLBACK_IMAGE
  const buttonHref = state === 'failed' ? '/checkout' : order ? '#order-details' : `/checkout/success?order=${encodeURIComponent(requestedOrder)}`
  const address = order ? [order.shipping_address_line_1, order.shipping_address_line_2, order.shipping_city, order.shipping_district, order.shipping_state, order.shipping_postal_code, order.shipping_country].filter(Boolean).join(', ') : ''

  return <main className="bg-white text-[#111]">
    <section className="relative flex min-h-[440px] items-center overflow-hidden border-b border-black/10 bg-[#f4f2ef] px-6 py-16 sm:px-10 lg:px-[8vw]" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,.78) 42%, rgba(255,255,255,.05) 72%), url('${mainImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="relative z-10 max-w-[610px]">
        <p className="font-[family-name:var(--font-family-secondary)] text-[11px] uppercase tracking-[0.22em]">{cms?.eyebrow || fallback.eyebrow}</p>
        <h1 className="mt-5 font-[family-name:var(--font-family-primary)] text-4xl font-normal leading-[1.05] sm:text-5xl lg:text-[58px]">{cms?.heading || fallback.heading}</h1>
        <p className="mt-5 max-w-xl font-[family-name:var(--font-family-secondary)] text-sm leading-7 text-neutral-700">{cms?.paragraph || fallback.paragraph}</p>
        <a href={buttonHref} className="mt-7 inline-flex h-12 items-center justify-center bg-black px-8 font-[family-name:var(--font-family-button)] text-xs uppercase tracking-[0.16em] text-white">{cms?.order_button_label || fallback.button}</a>
        {order ? <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-black/20 pt-4 font-[family-name:var(--font-family-secondary)] text-xs uppercase tracking-[0.12em]"><span>Order #{order.order_number}</span><span>Placed {date(order.created_at)}</span></div> : null}
      </div>
    </section>

    {order ? <section id="order-details" className="mx-auto grid max-w-[1440px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:px-12">
      <article className="border border-black/15 p-6 sm:p-8">
        <h2 className="font-[family-name:var(--font-family-secondary)] text-sm uppercase tracking-[0.16em]">Order details</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <div><CalendarDays size={19}/><p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-neutral-500">Estimated delivery</p><p className="mt-1 text-sm">Approximately 3 to 4 weeks</p></div>
          <div><MapPin size={19}/><p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-neutral-500">Shipping to</p><p className="mt-1 text-sm leading-6">{[order.customer_first_name, order.customer_last_name].filter(Boolean).join(' ')}<br/>{address}</p></div>
          <div><CreditCard size={19}/><p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-neutral-500">Payment method</p><p className="mt-1 text-sm capitalize">{order.razorpay_payment_method || order.payment_gateway || 'Online payment'}</p></div>
        </div>
      </article>
      <article className="border border-black/15 p-6 sm:p-8">
        <div className="flex items-center justify-between"><h2 className="font-[family-name:var(--font-family-secondary)] text-sm uppercase tracking-[0.16em]">Your order</h2>{!guestOrder ? <Link href="/profile?tab=orders" className="text-xs underline underline-offset-4">View order details</Link> : null}</div>
        <div className="mt-5 divide-y divide-black/10">{order.items.map((item, index) => <div key={`${item.product_name}-${index}`} className="grid grid-cols-[78px_1fr_auto] gap-4 py-4 first:pt-0"><div className="aspect-square bg-[#f5f5f5]">{item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-contain"/> : null}</div><div><p className="text-sm font-medium">{item.product_name}</p><p className="mt-1 text-xs leading-5 text-neutral-500">{[item.selected_metal, item.selected_purity, item.selected_size_or_fit, item.selected_gemstone, item.selected_carat].filter(Boolean).join(', ')}</p><p className="mt-2 text-xs text-neutral-500">Qty {item.quantity}{item.item_type === 'free_gift' ? ' - Complimentary gift' : ''}</p></div><p className="text-sm font-medium">{item.item_type === 'free_gift' ? 'Free' : money(item.line_total)}</p></div>)}</div>
        <div className="ml-auto mt-5 max-w-xs space-y-2 border-t border-black/10 pt-4 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(order.subtotal_amount)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{Number(order.shipping_amount) ? money(order.shipping_amount) : 'Complimentary'}</span></div><div className="flex justify-between"><span>GST</span><span>{money(order.gst_amount)}</span></div><div className="flex justify-between border-t border-black/10 pt-3 text-base font-semibold"><span>Total</span><span>{money(order.total_amount)}</span></div></div>
      </article>
    </section> : null}

    <section className="mx-auto max-w-[1440px] px-5 pb-14 sm:px-8 lg:px-12"><h2 className="border-b border-black/15 pb-3 font-[family-name:var(--font-family-secondary)] text-sm uppercase tracking-[0.16em]">What happens next</h2><div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">{[['1','Order confirmed','Your order has been securely received.'],['2','Quality checked','Your jewellery is carefully inspected by our team.'],['3','Carefully packaged','Your piece is placed inside our signature packaging.'],['4','On its way','You will receive tracking details once dispatched.']].map(([n,title,text]) => <div key={n} className="border-b border-black/10 px-4 py-7 sm:border-r"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-black text-xs">{n}</span><h3 className="mt-4 text-xs uppercase tracking-[0.14em]">{title}</h3><p className="mt-2 text-sm leading-6 text-neutral-600">{text}</p></div>)}</div></section>

    <section className="relative flex min-h-[260px] items-center bg-neutral-900 px-6 py-12 text-white sm:px-10 lg:px-[8vw]" style={{ backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.7), rgba(0,0,0,.12)), url('${secondaryImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="max-w-xl"><p className="text-[10px] uppercase tracking-[0.2em]">{page?.secondary_eyebrow || 'Made with intention'}</p><h2 className="mt-3 font-[family-name:var(--font-family-primary)] text-4xl">{page?.secondary_heading || 'Every piece tells a story.'}</h2><p className="mt-3 text-sm leading-7 text-white/85">{page?.secondary_paragraph || 'Your jewellery is prepared and inspected with care before it begins its journey to you.'}</p></div></section>

    <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_1.35fr] lg:px-12"><div><h2 className="text-xs uppercase tracking-[0.16em]">Need anything?</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">{(payload?.contact?.length ? payload.contact.slice(0,2) : [{id:'fallback',label:'Contact concierge',value:'We are here to help with your order.'}]).map(item => <div key={item.id}><p className="text-xs font-semibold uppercase tracking-[0.12em]">{item.label}</p>{item.href ? <a href={item.href} className="mt-2 block text-sm underline underline-offset-4">{item.value}</a> : <p className="mt-2 text-sm">{item.value}</p>}<p className="mt-1 text-xs text-neutral-500">{item.note}</p></div>)}</div></div><div><h2 className="text-xs uppercase tracking-[0.16em]">Continue exploring</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{(payload?.categories || []).map(category => <Link key={category.slug} href={`/collections/${category.slug}`} className="flex h-12 items-center justify-between border border-black/20 px-4 text-xs uppercase tracking-[0.1em] hover:bg-black hover:text-white"><span>{category.name}</span><span aria-hidden>+</span></Link>)}</div></div></section>
  </main>
}
