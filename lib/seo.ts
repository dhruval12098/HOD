import type { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/site-url'

const defaultOgImage = '/logo.jpeg'

type PageSeoInput = {
  title: string
  description: string
  path: string
  image?: string | null
  type?: 'website' | 'article'
}

export function createPageMetadata({
  title,
  description,
  path,
  image = defaultOgImage,
  type = 'website',
}: PageSeoInput): Metadata {
  const canonical = getCanonicalUrl(path)
  const normalizedTitle = title.replace(/\s*\|\s*House of Diams\s*$/i, '').trim()
  const images = image ? [{ url: image, alt: `${normalizedTitle} - House of Diams` }] : undefined

  return {
    title: normalizedTitle,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: normalizedTitle,
      description,
      url: canonical,
      siteName: 'House of Diams',
      type,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: normalizedTitle,
      description,
      images: image ? [image] : undefined,
    },
  }
}
