/**
 * Утилиты для работы с Google Analytics 4
 */

// Отправка события в GA4 (клиентская сторона)
export const sendGAEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// Отправка pageview в GA4
export const sendGAPageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
      page_path: url,
    })
  }
}

// Типы для window.gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

/**
 * Получение данных из Google Analytics 4 Data API
 * Требует серверный API key или OAuth
 */
export async function getGA4Data(
  propertyId: string,
  startDate: string,
  endDate: string,
  metrics: string[],
  dimensions?: string[]
) {
  // TODO: Реализовать через Google Analytics Data API
  // Требуется настройка OAuth или Service Account
  // https://developers.google.com/analytics/devguides/reporting/data/v1

  console.warn('GA4 Data API not implemented yet')
  return {
    metrics: [],
    dimensions: [],
  }
}
