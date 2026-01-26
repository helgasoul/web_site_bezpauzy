'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, BarChart3, Megaphone, Sliders, AlertCircle, CheckCircle2, X } from 'lucide-react'
import Link from 'next/link'
import {
  getCookiePreferences,
  saveCookiePreferences,
  getDefaultCookiePreferences,
  loadCookiePreferencesFromDB,
  type CookiePreferences,
  type CookieCategory,
  initializeAnalytics,
  clearNonEssentialCookies,
} from '@/lib/cookies/manager'

interface CookieManagerProps {}

export const CookieManager: FC<CookieManagerProps> = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>(getDefaultCookiePreferences())
  const [isLoaded, setIsLoaded] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<number | undefined>(undefined)

  useEffect(() => {
    const loadPreferences = async () => {
      // Проверяем авторизацию
      try {
        const response = await fetch('/api/auth/telegram/get-session', {
          credentials: 'include',
        })
        const data = await response.json()
        if (data.authenticated && data.user?.id) {
          setIsAuthenticated(true)
          setUserId(data.user.id)
          
          // Пытаемся загрузить из БД
          const dbPreferences = await loadCookiePreferencesFromDB()
          if (dbPreferences) {
            setPreferences(dbPreferences)
            setIsLoaded(true)
            return
          }
        }
      } catch (error) {
        // Не критично, работаем без БД
      }
      
      // Загружаем из localStorage
      const saved = getCookiePreferences()
      if (saved) {
        setPreferences(saved)
      }
      setIsLoaded(true)
    }

    loadPreferences()
  }, [])

  const toggleCategory = (category: CookieCategory) => {
    if (category === 'necessary') return
    
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      await saveCookiePreferences(preferences, {
        isAuthenticated,
        userId,
      })
      setSaved(true)
      
      if (preferences.analytics) {
        initializeAnalytics()
      } else {
        clearNonEssentialCookies()
      }

      // Прокручиваем к сообщению об успехе
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      setTimeout(() => setSaved(false), 5000)
    } catch (error) {
      console.error('Ошибка при сохранении настроек cookie:', error)
      // Можно добавить сообщение об ошибке
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mx-auto mb-4"></div>
          <p className="text-body text-deep-navy/70">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-soft-white to-white py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-purple/20 to-ocean-wave-start/20 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-purple" />
            </div>
            <div>
              <h1 className="text-h2 md:text-h1 font-bold text-deep-navy">
                Управление cookie
              </h1>
              <p className="text-body text-deep-navy/70 mt-1">
                Выберите, какие cookie вы разрешаете использовать
              </p>
            </div>
          </div>

          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3 shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-body font-semibold text-green-800">Настройки успешно сохранены!</p>
                <p className="text-sm text-green-700 mt-1">Ваши предпочтения cookie сохранены и применены.</p>
              </div>
            </motion.div>
          )}

          <div className="space-y-4 mb-8">
            {/* Необходимые cookie */}
            <div className="bg-lavender-bg rounded-xl p-6 border-2 border-primary-purple/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <AlertCircle className="w-6 h-6 text-primary-purple flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-h5 font-semibold text-deep-navy mb-2">
                      Необходимые cookie
                    </h3>
                    <p className="text-body-small text-deep-navy/70 mb-2">
                      Эти cookie необходимы для работы сайта и не могут быть отключены. 
                      Они используются для безопасности, сессий и основных функций.
                    </p>
                    <p className="text-xs text-deep-navy/60">
                      Примеры: сохранение сессии, безопасность, базовые функции сайта
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="w-14 h-7 bg-primary-purple rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Аналитика */}
            <div className="bg-white rounded-xl p-6 border-2 border-lavender-bg hover:border-primary-purple/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <BarChart3 className="w-6 h-6 text-primary-purple flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-h5 font-semibold text-deep-navy mb-2">
                      Аналитика
                    </h3>
                    <p className="text-body-small text-deep-navy/70 mb-2">
                      Помогают нам понять, как посетители используют сайт. 
                      Это помогает улучшать сайт и делать его более удобным.
                    </p>
                    <p className="text-xs text-deep-navy/60">
                      Используемые сервисы: Yandex Metrica, Google Analytics
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleCategory('analytics')}
                  className={`flex-shrink-0 ml-4 w-14 h-7 rounded-full transition-colors relative ${
                    preferences.analytics ? 'bg-primary-purple' : 'bg-lavender-bg'
                  }`}
                  aria-label="Переключить аналитику"
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      preferences.analytics ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Маркетинг */}
            <div className="bg-white rounded-xl p-6 border-2 border-lavender-bg hover:border-primary-purple/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Megaphone className="w-6 h-6 text-primary-purple flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-h5 font-semibold text-deep-navy mb-2">
                      Маркетинг
                    </h3>
                    <p className="text-body-small text-deep-navy/70 mb-2">
                      Используются для показа релевантной рекламы и отслеживания эффективности рекламных кампаний.
                    </p>
                    <p className="text-xs text-deep-navy/60">
                      Примеры: ретаргетинг, отслеживание конверсий, персонализация рекламы
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleCategory('marketing')}
                  className={`flex-shrink-0 ml-4 w-14 h-7 rounded-full transition-colors relative ${
                    preferences.marketing ? 'bg-primary-purple' : 'bg-lavender-bg'
                  }`}
                  aria-label="Переключить маркетинг"
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      preferences.marketing ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Функциональные */}
            <div className="bg-white rounded-xl p-6 border-2 border-lavender-bg hover:border-primary-purple/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Sliders className="w-6 h-6 text-primary-purple flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-h5 font-semibold text-deep-navy mb-2">
                      Функциональные
                    </h3>
                    <p className="text-body-small text-deep-navy/70 mb-2">
                      Позволяют сайту запоминать ваши предпочтения для более удобного использования.
                    </p>
                    <p className="text-xs text-deep-navy/60">
                      Примеры: язык, регион, настройки отображения, сохраненные данные форм
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleCategory('functional')}
                  className={`flex-shrink-0 ml-4 w-14 h-7 rounded-full transition-colors relative ${
                    preferences.functional ? 'bg-primary-purple' : 'bg-lavender-bg'
                  }`}
                  aria-label="Переключить функциональные"
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                      preferences.functional ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-lavender-bg">
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-white border-2 border-lavender-bg text-deep-navy rounded-full font-semibold hover:bg-lavender-bg transition-colors text-center"
            >
              На главную
            </Link>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Сохранить настройки
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-lavender-bg">
            <p className="text-body-small text-deep-navy/70 text-center">
              Подробнее о том, как мы используем cookie, читайте в{' '}
              <Link
                href="/legal/cookies"
                className="text-primary-purple hover:text-ocean-wave-start underline font-medium"
              >
                политике использования cookie
              </Link>
              {' '}и{' '}
              <Link
                href="/privacy"
                className="text-primary-purple hover:text-ocean-wave-start underline font-medium"
              >
                политике конфиденциальности
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

