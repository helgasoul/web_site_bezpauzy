'use client'

import { useEffect } from 'react'
import { hasCookieConsent, getCookiePreferences } from '@/lib/cookies/manager'
import { initAnalytics } from '@/lib/analytics/init'

/**
 * Компонент для инициализации аналитики после загрузки страницы
 * Проверяет согласие пользователя перед инициализацией
 */
export function AnalyticsScripts() {
  useEffect(() => {
    // Ждем, пока пользователь даст согласие
    if (!hasCookieConsent()) {
      return
    }

    const preferences = getCookiePreferences()
    if (!preferences) {
      return
    }

    // Инициализируем аналитику только если пользователь дал согласие
    if (preferences.analytics) {
      // Небольшая задержка, чтобы убедиться, что скрипты аналитики загружены
      const timer = setTimeout(() => {
        initAnalytics()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  // Этот компонент не рендерит ничего
  return null
}

