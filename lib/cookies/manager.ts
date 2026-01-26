/**
 * Утилиты для управления cookie и согласием пользователя
 */

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'functional'

export interface CookiePreferences {
  necessary: boolean // Всегда true, нельзя отключить
  analytics: boolean
  marketing: boolean
  functional: boolean
  timestamp: number // Timestamp когда были сохранены настройки
}

const COOKIE_CONSENT_KEY = 'cookie_consent'
const COOKIE_PREFERENCES_KEY = 'cookie_preferences'

/**
 * Получить сохраненные настройки cookie
 */
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    if (!stored) return null

    const preferences = JSON.parse(stored) as CookiePreferences
    return preferences
  } catch (error) {
    console.error('Error reading cookie preferences:', error)
    return null
  }
}

/**
 * Сохранить настройки cookie
 * Для авторизованных пользователей сохраняет в БД, для неавторизованных - в localStorage
 */
export async function saveCookiePreferences(
  preferences: CookiePreferences,
  options?: { isAuthenticated?: boolean; userId?: number }
): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    // Всегда сохраняем в localStorage для быстрого доступа
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences))
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
    
    // Также сохраняем в cookie для серверной стороны
    document.cookie = `${COOKIE_CONSENT_KEY}=true; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
    document.cookie = `${COOKIE_PREFERENCES_KEY}=${encodeURIComponent(JSON.stringify(preferences))}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`

    // Если пользователь авторизован, сохраняем в БД для синхронизации между устройствами
    if (options?.isAuthenticated && options?.userId) {
      try {
        const response = await fetch('/api/cookies/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ preferences }),
        })

        if (!response.ok) {
          const error = await response.json()
          console.warn('⚠️ [Cookies] Не удалось сохранить настройки в БД:', error)
          // Не прерываем выполнение, настройки сохранены в localStorage
        } else {
          console.log('✅ [Cookies] Настройки сохранены в БД')
        }
      } catch (error) {
        console.warn('⚠️ [Cookies] Ошибка при сохранении в БД:', error)
        // Не прерываем выполнение, настройки сохранены в localStorage
      }
    }
  } catch (error) {
    console.error('Error saving cookie preferences:', error)
  }
}

/**
 * Загрузить настройки cookie из БД для авторизованного пользователя
 */
export async function loadCookiePreferencesFromDB(): Promise<CookiePreferences | null> {
  if (typeof window === 'undefined') return null

  try {
    const response = await fetch('/api/cookies/preferences', {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      // Пользователь не авторизован или настройки не найдены
      return null
    }

    const data = await response.json()
    
    if (data.preferences) {
      // Сохраняем в localStorage для быстрого доступа
      const preferences = data.preferences as CookiePreferences
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences))
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
      document.cookie = `${COOKIE_CONSENT_KEY}=true; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
      document.cookie = `${COOKIE_PREFERENCES_KEY}=${encodeURIComponent(JSON.stringify(preferences))}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
      
      return preferences
    }

    return null
  } catch (error) {
    console.error('Error loading cookie preferences from DB:', error)
    return null
  }
}

/**
 * Проверить, дал ли пользователь согласие
 */
export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    return consent === 'true'
  } catch (error) {
    return false
  }
}

/**
 * Проверить, разрешена ли категория cookie
 */
export function isCookieCategoryAllowed(category: CookieCategory): boolean {
  const preferences = getCookiePreferences()
  
  if (!preferences) return false

  // Необходимые cookie всегда разрешены
  if (category === 'necessary') return true

  return preferences[category] === true
}

/**
 * Получить настройки по умолчанию
 */
export function getDefaultCookiePreferences(): CookiePreferences {
  return {
    necessary: true, // Всегда включено
    analytics: false,
    marketing: false,
    functional: false,
    timestamp: Date.now(),
  }
}

/**
 * Инициализация аналитики на основе согласия
 * @deprecated Используйте initAnalytics из @/lib/analytics/init
 */
export function initializeAnalytics(): void {
  // Импортируем динамически, чтобы избежать циклических зависимостей
  import('@/lib/analytics/init').then(({ initAnalytics }) => {
    initAnalytics()
  })
}

/**
 * Удалить все cookie (кроме необходимых)
 */
export function clearNonEssentialCookies(): void {
  if (typeof window === 'undefined') return

  const cookies = document.cookie.split(';')
  
  cookies.forEach((cookie) => {
    const eqPos = cookie.indexOf('=')
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
    
    // Не удаляем необходимые cookie
    if (name && !name.startsWith(COOKIE_CONSENT_KEY) && !name.startsWith(COOKIE_PREFERENCES_KEY)) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
  })
}

