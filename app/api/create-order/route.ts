import { NextResponse } from 'next/server'
import { isRazorpayConfigured } from '@/lib/razorpay'

export async function POST(request: Request) {
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: 'Razorpay is not configured yet.' }, { status: 500 })
  }

  return NextResponse.json({ error: 'Direct order creation is disabled. Use the checkout payment flow.' }, { status: 403 })
}
