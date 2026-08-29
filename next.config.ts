import type { NextConfig } from "next";

const r2PublicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, '') ?? ''
let r2RemotePattern: { protocol: 'http' | 'https'; hostname: string; port?: string; pathname?: string } | null = null

if (r2PublicBaseUrl) {
  try {
    const url = new URL(r2PublicBaseUrl)
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      r2RemotePattern = {
        protocol: url.protocol.slice(0, -1) as 'http' | 'https',
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: `${url.pathname.replace(/\/+$/, '') || ''}/**`,
      }
    }
  } catch {
    // Invalid optional configuration leaves the existing Supabase image path unchanged.
  }
}

const securityHeaders = [
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com https://ajax.googleapis.com https://*.clarity.ms",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://maps.googleapis.com https://checkout.razorpay.com https://api.razorpay.com https://www.google-analytics.com https://www.googletagmanager.com https://ajax.googleapis.com https://*.clarity.ms",
      "media-src 'self' data: blob: https:",
      "frame-src 'self' https://checkout.razorpay.com https://www.googletagmanager.com",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
      "report-uri /api/csp-report",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
]

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  env: {
    NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_BASE_URL: r2PublicBaseUrl,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      ...(r2RemotePattern ? [r2RemotePattern] : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/.well-known/apple-developer-merchantid-domain-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
        ],
      },
      {
        source: '/animation%20images/frames/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/frames/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
