/**
 * Утилиты для работы с Yandex.Metrica
 */

// Отправка цели в Yandex.Metrica (клиентская сторона)
export const sendYMGoal = (goalName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.ym) {
    const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
    if (metrikaId) {
      window.ym(parseInt(metrikaId), 'reachGoal', goalName, params)
    }
  }
}

// Отправка хита в Yandex.Metrica
export const sendYMHit = (url: string, options?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.ym) {
    const metrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
    if (metrikaId) {
      window.ym(parseInt(metrikaId), 'hit', url, options)
    }
  }
}

// Типы для window.ym
declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: any[]) => void
  }
}

/**
 * Получение данных из Yandex.Metrica API
 * Требует OAuth токен
 * Документация: https://yandex.ru/dev/metrika/doc/api2/concept/about.html
 */
export async function getYandexMetricaData(
  counterId: string,
  oauth_token: string,
  startDate: string,
  endDate: string,
  metrics: string[],
  dimensions?: string[]
) {
  try {
    const metricsStr = metrics.join(',')
    const dimensionsStr = dimensions?.join(',') || ''

    const url = `https://api-metrika.yandex.net/stat/v1/data?id=${counterId}&date1=${startDate}&date2=${endDate}&metrics=${metricsStr}${
      dimensionsStr ? `&dimensions=${dimensionsStr}` : ''
    }`

    const response = await fetch(url, {
      headers: {
        Authorization: `OAuth ${oauth_token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Yandex.Metrica API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching Yandex.Metrica data:', error)
    return null
  }
}

/**
 * Форматирование даты для Yandex.Metrica API (YYYY-MM-DD)
 */
export function formatDateForYM(date: Date): string {
  return date.toISOString().split('T')[0]
}
