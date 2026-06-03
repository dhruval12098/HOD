import crypto from 'node:crypto'
import Razorpay from 'razorpay'

export const RAZORPAY_CURRENCY = process.env.RAZORPAY_CURRENCY || 'INR'

export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
}

export function isRazorpayConfigured() {
  return Boolean(getRazorpayKeyId() && process.env.RAZORPAY_KEY_SECRET)
}

export function getRazorpayClient() {
  const key_id = getRazorpayKeyId()
  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_id || !key_secret) {
    throw new Error('Missing Razorpay environment variables.')
  }

  return new Razorpay({ key_id, key_secret })
}

export function verifyRazorpayPaymentSignature(input: {
  orderId: string
  paymentId: string
  signature: string
}) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) throw new Error('Missing Razorpay secret key.')

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest('hex')

  return expected === input.signature
}

export function verifyRazorpayWebhookSignature(payload: string, signature: string) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) throw new Error('Missing Razorpay webhook secret.')

  const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex')
  return expected === signature
}
