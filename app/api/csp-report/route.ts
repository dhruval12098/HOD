import { enforceRateLimit } from '@/lib/rate-limit'

const MAX_REPORT_BYTES = 16 * 1024
const MAX_FIELD_LENGTH = 500
const SUPPORTED_CONTENT_TYPES = ['application/csp-report', 'application/reports+json', 'application/json']

function trimField(value: unknown) {
  return typeof value === 'string' ? value.slice(0, MAX_FIELD_LENGTH) : undefined
}

function stripUrlDetails(value: unknown) {
  const text = trimField(value)
  if (!text) return undefined
  if (/^(data|blob):/i.test(text)) return text.slice(0, text.indexOf(':') + 1)
  if (!/^https?:/i.test(text)) return text

  try {
    const url = new URL(text)
    return `${url.origin}${url.pathname}`.slice(0, MAX_FIELD_LENGTH)
  } catch {
    return undefined
  }
}

function normalizeReport(envelope: unknown) {
  if (!envelope || typeof envelope !== 'object') return null

  const record = envelope as Record<string, unknown>
  const legacyBody = record['csp-report']
  const body = legacyBody && typeof legacyBody === 'object'
    ? legacyBody as Record<string, unknown>
    : record.body && typeof record.body === 'object'
      ? record.body as Record<string, unknown>
      : record

  return {
    type: trimField(record.type),
    disposition: trimField(body.disposition),
    effectiveDirective: trimField(body['effective-directive'] ?? body.effectiveDirective),
    violatedDirective: trimField(body['violated-directive'] ?? body.violatedDirective),
    documentUrl: stripUrlDetails(body['document-uri'] ?? body.documentURL),
    blockedUrl: stripUrlDetails(body['blocked-uri'] ?? body.blockedURL),
    sourceFile: stripUrlDetails(body['source-file'] ?? body.sourceFile),
    lineNumber: typeof (body['line-number'] ?? body.lineNumber) === 'number'
      ? body['line-number'] ?? body.lineNumber
      : undefined,
    statusCode: typeof (body['status-code'] ?? body.statusCode) === 'number'
      ? body['status-code'] ?? body.statusCode
      : undefined,
  }
}

function normalizeReports(payload: unknown) {
  const envelopes = Array.isArray(payload) ? payload.slice(0, 20) : [payload]
  return envelopes.map(normalizeReport).filter((report) => report !== null)
}

export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit(request, { key: 'csp-report', limit: 60, windowSeconds: 60 })
  if (!rateLimit.ok) return new Response(null, { status: 204 })

  const contentLength = Number(request.headers.get('content-length') || 0)
  const contentType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase() || ''
  if (contentLength > MAX_REPORT_BYTES || !SUPPORTED_CONTENT_TYPES.includes(contentType)) {
    return new Response(null, { status: 204 })
  }

  try {
    const rawBody = await request.text()
    if (new TextEncoder().encode(rawBody).byteLength > MAX_REPORT_BYTES) {
      return new Response(null, { status: 204 })
    }

    const reports = normalizeReports(JSON.parse(rawBody) as unknown)
    for (const report of reports) console.error('CSP violation report:', report)
  } catch {
    // Browsers do not need an error response for malformed or unsupported reports.
  }

  return new Response(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  })
}
