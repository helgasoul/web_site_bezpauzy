/**
 * Утилиты для генерации метаданных с canonical URLs
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'

/**
 * Генерация canonical URL для страницы
 */
export function getCanonicalUrl(path: string): string {
  // Убираем начальный слэш, если есть
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${cleanPath}`
}

/**
 * Добавление canonical URL к существующим метаданным
 */
export function addCanonicalToMetadata(
  metadata: any,
  path: string
): any {
  return {
    ...metadata,
    alternates: {
      canonical: getCanonicalUrl(path),
    },
  }
}

