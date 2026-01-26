import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/chat/',
          '/community/dashboard/',
          '/newsletter/unsubscribe/',
          '/quiz/*/pdf/',
          '/quiz/*/results/',
          '/quiz/history/',
          '/quiz/get-results/',
          '/quiz/save-results/',
          '/quiz/delete-result/',
          '/auth/',
          '/debug/',
        ],
      },
      // Разрешаем индексацию для поисковых систем
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/chat/',
          '/community/dashboard/',
          '/newsletter/unsubscribe/',
          '/quiz/*/pdf/',
          '/quiz/*/results/',
          '/quiz/history/',
          '/auth/',
          '/debug/',
        ],
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/chat/',
          '/community/dashboard/',
          '/newsletter/unsubscribe/',
          '/quiz/*/pdf/',
          '/quiz/*/results/',
          '/quiz/history/',
          '/auth/',
          '/debug/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

