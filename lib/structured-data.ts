import type { StorefrontProduct } from '@/lib/catalog-products'
import { getCanonicalUrl, getSiteUrl } from '@/lib/site-url'

type FaqSchemaItem = {
  question: string
  answer: string
}

export function createOrganizationSchema() {
  const siteUrl = getSiteUrl()

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'House of Diams',
    url: siteUrl,
    logo: getCanonicalUrl('/logo.jpeg').toString(),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'info@houseofdiams.com',
        telephone: '+91 93285 36178',
        contactType: 'customer support',
        availableLanguage: ['English', 'Hindi'],
      },
    ],
    address: [
      {
        '@type': 'PostalAddress',
        addressLocality: 'Surat',
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
      {
        '@type': 'PostalAddress',
        addressLocality: 'New York',
        addressRegion: 'NY',
        addressCountry: 'US',
      },
    ],
  }
}

export function createBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.path).toString(),
    })),
  }
}

export function createProductSchema(product: StorefrontProduct) {
  const imageUrls = [product.imageUrl, ...(product.galleryUrls ?? [])].filter(Boolean)
  const price = Number(product.priceFrom)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.descriptionText || product.shortMeta,
    sku: product.dbId,
    category: product.mainCategoryName || product.category,
    brand: {
      '@type': 'Brand',
      name: 'House of Diams',
    },
    image: imageUrls,
    url: getCanonicalUrl(`/shop/${product.slug}`).toString(),
    material: product.metalsFull.map((metal) => metal.displayLabel || metal.name).filter(Boolean),
    offers: Number.isFinite(price) && price > 0
      ? {
          '@type': 'Offer',
          price,
          priceCurrency: 'USD',
          availability: product.stockQuantity === 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          url: getCanonicalUrl(`/shop/${product.slug}`).toString(),
          seller: {
            '@type': 'Organization',
            name: 'House of Diams',
          },
        }
      : undefined,
  }
}

export function createFaqSchema(items: FaqSchemaItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
