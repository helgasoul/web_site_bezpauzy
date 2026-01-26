/**
 * Утилиты для генерации структурированных данных Schema.org (JSON-LD)
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'

export interface OrganizationSchema {
  '@context': string
  '@type': string
  name: string
  url: string
  logo: string
  description: string
  sameAs?: string[]
  contactPoint?: {
    '@type': string
    contactType: string
    email?: string
    url?: string
  }
}

export interface ArticleSchema {
  '@context': string
  '@type': string
  headline: string
  description: string
  image: string | string[]
  datePublished: string
  dateModified: string
  author: {
    '@type': string
    name: string
    jobTitle?: string
  }
  publisher: {
    '@type': string
    name: string
    logo: {
      '@type': string
      url: string
    }
  }
  mainEntityOfPage: {
    '@type': string
    '@id': string
  }
}

export interface FAQPageSchema {
  '@context': string
  '@type': string
  mainEntity: Array<{
    '@type': string
    name: string
    acceptedAnswer: {
      '@type': string
      text: string
    }
  }>
}

export interface BreadcrumbListSchema {
  '@context': string
  '@type': string
  itemListElement: Array<{
    '@type': string
    position: number
    name: string
    item: string
  }>
}

export interface BookSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  author: {
    '@type': string
    name: string
  }
  publisher: {
    '@type': string
    name: string
    logo: {
      '@type': string
      url: string
    }
  }
  datePublished?: string
  image?: string
  isbn?: string
  numberOfPages?: number
  aggregateRating?: {
    '@type': string
    ratingValue: string
    reviewCount: string
  }
}

export interface PersonSchema {
  '@context': string
  '@type': string
  name: string
  jobTitle: string
  description?: string
  image?: string
  url?: string
  sameAs?: string[]
}

export interface VideoObjectSchema {
  '@context': string
  '@type': string
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration?: string
  contentUrl?: string
  embedUrl?: string
}

/**
 * Генерация Organization schema для главной страницы
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Без |Паузы',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Научно обоснованная поддержка для женщин 40+ в период менопаузы. Консультации с AI, врачи, видео и книга.',
    sameAs: [
      'https://t.me/bezpauzi',
      // Можно добавить другие социальные сети
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: `${SITE_URL}/about`,
    },
  }
}

/**
 * Генерация Article schema для статей блога
 */
export function generateArticleSchema(params: {
  title: string
  description: string
  image: string
  datePublished: string
  dateModified: string
  authorName: string
  authorRole?: string
  url: string
}): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    image: params.image.startsWith('http') ? params.image : `${SITE_URL}${params.image}`,
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    author: {
      '@type': 'Person',
      name: params.authorName,
      jobTitle: params.authorRole || 'Эксперт',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Без |Паузы',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`,
    },
  }
}

/**
 * Генерация FAQPage schema
 */
export function generateFAQPageSchema(faqs: Array<{ question: string; answer: string }>): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Генерация BreadcrumbList schema
 */
export function generateBreadcrumbListSchema(items: Array<{ name: string; url: string }>): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

/**
 * Генерация Book schema
 */
export function generateBookSchema(params: {
  name: string
  description: string
  authorName: string
  datePublished?: string
  image?: string
  isbn?: string
  numberOfPages?: number
  rating?: { value: number; count: number }
}): BookSchema {
  const schema: BookSchema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: params.name,
    description: params.description,
    author: {
      '@type': 'Person',
      name: params.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Без |Паузы',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  }

  if (params.datePublished) {
    schema.datePublished = params.datePublished
  }

  if (params.image) {
    schema.image = params.image.startsWith('http') ? params.image : `${SITE_URL}${params.image}`
  }

  if (params.isbn) {
    schema.isbn = params.isbn
  }

  if (params.numberOfPages) {
    schema.numberOfPages = params.numberOfPages
  }

  if (params.rating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: params.rating.value.toString(),
      reviewCount: params.rating.count.toString(),
    }
  }

  return schema
}

/**
 * Генерация Person schema для врачей
 */
export function generatePersonSchema(params: {
  name: string
  jobTitle: string
  description?: string
  image?: string
  url?: string
  sameAs?: string[]
}): PersonSchema {
  const schema: PersonSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: params.name,
    jobTitle: params.jobTitle,
  }

  if (params.description) {
    schema.description = params.description
  }

  if (params.image) {
    schema.image = params.image.startsWith('http') ? params.image : `${SITE_URL}${params.image}`
  }

  if (params.url) {
    schema.url = params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`
  }

  if (params.sameAs && params.sameAs.length > 0) {
    schema.sameAs = params.sameAs
  }

  return schema
}

/**
 * Генерация VideoObject schema
 */
export function generateVideoObjectSchema(params: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  duration?: string
  contentUrl?: string
  embedUrl?: string
}): VideoObjectSchema {
  const schema: VideoObjectSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: params.name,
    description: params.description,
    thumbnailUrl: params.thumbnailUrl.startsWith('http')
      ? params.thumbnailUrl
      : `${SITE_URL}${params.thumbnailUrl}`,
    uploadDate: params.uploadDate,
  }

  if (params.duration) {
    schema.duration = params.duration
  }

  if (params.contentUrl) {
    schema.contentUrl = params.contentUrl
  }

  if (params.embedUrl) {
    schema.embedUrl = params.embedUrl
  }

  return schema
}

