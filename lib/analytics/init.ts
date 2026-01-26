/**
 * Инициализация аналитики на основе согласия пользователя
 */

import { isCookieCategoryAllowed } from '@/lib/cookies/manager'

/**
 * Инициализация Yandex Metrica
 */
export function initYandexMetrika(): void {
  if (typeof window === 'undefined') return

  const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
  if (!yandexMetrikaId) return

  // Проверяем согласие на аналитику
  if (!isCookieCategoryAllowed('analytics')) {
    console.log('📊 [Analytics] Yandex Metrica отключена (нет согласия на аналитику)')
    return
  }

  // Инициализация Yandex Metrica
  // @ts-ignore
  if (window.ym) {
    // @ts-ignore
    window.ym(yandexMetrikaId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    })
    console.log('✅ [Analytics] Yandex Metrica инициализирована')
  } else {
    console.warn('⚠️ [Analytics] Yandex Metrica скрипт не загружен')
  }
}

/**
 * Инициализация Google Analytics
 */
export function initGoogleAnalytics(): void {
  if (typeof window === 'undefined') return

  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (!gaId) return

  // Проверяем согласие на аналитику
  if (!isCookieCategoryAllowed('analytics')) {
    console.log('📊 [Analytics] Google Analytics отключен (нет согласия на аналитику)')
    // @ts-ignore
    if (window.gtag) {
      // @ts-ignore
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      })
    }
    return
  }

  // @ts-ignore
  if (window.gtag) {
    // @ts-ignore
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    })
    console.log('✅ [Analytics] Google Analytics инициализирован')
  } else {
    console.warn('⚠️ [Analytics] Google Analytics скрипт не загружен')
  }
}

/**
 * Инициализация всей аналитики
 */
export function initAnalytics(): void {
  initYandexMetrika()
  initGoogleAnalytics()
}

