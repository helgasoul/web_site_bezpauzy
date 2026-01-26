'use client'

import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings, CheckCircle2, AlertCircle, Cookie, BarChart3, Megaphone, Sliders } from 'lucide-react'
import Link from 'next/link'
import {
  getCookiePreferences,
  saveCookiePreferences,
  hasCookieConsent,
  getDefaultCookiePreferences,
  loadCookiePreferencesFromDB,
  type CookiePreferences,
  type CookieCategory,
  initializeAnalytics,
  clearNonEssentialCookies,
} from '@/lib/cookies/manager'

interface CookieConsentProps {}

export const CookieConsent: FC<CookieConsentProps> = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(getDefaultCookiePreferences())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<number | undefined>(undefined)

  useEffect(() => {
    // Проверяем авторизацию
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/telegram/get-session', {
          credentials: 'include',
        })
        const data = await response.json()
        if (data.authenticated && data.user?.id) {
          setIsAuthenticated(true)
          setUserId(data.user.id)
          
          // Загружаем настройки из БД
          const dbPreferences = await loadCookiePreferencesFromDB()
          if (dbPreferences) {
            setPreferences(dbPreferences)
            initializeAnalytics()
            return
          }
        }
      } catch (error) {
        // Не критично, работаем без БД
      }
      
      // Проверяем localStorage
      if (!hasCookieConsent()) {
        setIsVisible(true)
      } else {
        const saved = getCookiePreferences()
        if (saved) {
          setPreferences(saved)
          initializeAnalytics()
        }
      }
    }

    checkAuth()
  }, [])

  const handleAcceptAll = async () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: Date.now(),
    }
    
    await saveCookiePreferences(allAccepted, {
      isAuthenticated,
      userId,
    })
    setIsVisible(false)
    initializeAnalytics()
  }

  const handleRejectAll = async () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: Date.now(),
    }
    
    await saveCookiePreferences(onlyNecessary, {
      isAuthenticated,
      userId,
    })
    setIsVisible(false)
    clearNonEssentialCookies()
  }

  const handleSavePreferences = async () => {
    await saveCookiePreferences(preferences, {
      isAuthenticated,
      userId,
    })
    setIsVisible(false)
    
    if (preferences.analytics) {
      initializeAnalytics()
    } else {
      clearNonEssentialCookies()
    }
  }

  const toggleCategory = (category: CookieCategory) => {
    if (category === 'necessary') return // Нельзя отключить необходимые
    
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-lavender-bg overflow-hidden">
              {!showSettings ? (
                // Простой вид (по умолчанию)
                <div className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-purple/20 to-ocean-wave-start/20 rounded-xl flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-primary-purple" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-h5 font-bold text-deep-navy mb-2">
                        Мы используем cookie
                      </h3>
                      <p className="text-body text-deep-navy/70 mb-4">
                        Мы используем cookie для улучшения работы сайта, аналитики и персонализации. 
                        Вы можете выбрать, какие cookie разрешить.{' '}
                        <Link
                          href="/legal/cookies"
                          className="text-primary-purple hover:text-ocean-wave-start underline font-medium"
                        >
                          Подробнее в политике использования cookie
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
                    <button
                      onClick={() => setIsVisible(false)}
                      className="flex-shrink-0 p-2 hover:bg-lavender-bg rounded-full transition-colors"
                      aria-label="Закрыть"
                    >
                      <X className="w-5 h-5 text-deep-navy/70" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex-1 px-6 py-3 bg-white border-2 border-primary-purple text-primary-purple rounded-full font-semibold hover:bg-primary-purple/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <Settings className="w-5 h-5" />
                      Настроить
                    </button>
                    <button
                      onClick={handleRejectAll}
                      className="flex-1 px-6 py-3 bg-white border-2 border-lavender-bg text-deep-navy rounded-full font-semibold hover:bg-lavender-bg transition-colors"
                    >
                      Отклонить все
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-lg transition-all"
                    >
                      Принять все
                    </button>
                  </div>
                </div>
              ) : (
                // Расширенный вид с настройками
                <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-h4 font-bold text-deep-navy flex items-center gap-3">
                      <Settings className="w-6 h-6 text-primary-purple" />
                      Настройки cookie
                    </h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-2 hover:bg-lavender-bg rounded-full transition-colors"
                      aria-label="Закрыть"
                    >
                      <X className="w-5 h-5 text-deep-navy/70" />
                    </button>
                  </div>

                  <p className="text-body text-deep-navy/70 mb-6">
                    Выберите, какие категории cookie вы разрешаете использовать. 
                    Необходимые cookie всегда активны, так как они нужны для работы сайта.
                  </p>

                  <div className="space-y-4 mb-6">
                    {/* Необходимые cookie */}
                    <div className="bg-lavender-bg rounded-xl p-5 border-2 border-primary-purple/20">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <AlertCircle className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-body font-semibold text-deep-navy mb-1">
                              Необходимые cookie
                            </h4>
                            <p className="text-body-small text-deep-navy/70">
                              Эти cookie необходимы для работы сайта и не могут быть отключены. 
                              Они используются для безопасности, сессий и основных функций.
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <div className="w-12 h-6 bg-primary-purple rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Аналитика */}
                    <div className="bg-white rounded-xl p-5 border-2 border-lavender-bg hover:border-primary-purple/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <BarChart3 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-body font-semibold text-deep-navy mb-1">
                              Аналитика
                            </h4>
                            <p className="text-body-small text-deep-navy/70 mb-2">
                              Помогают нам понять, как посетители используют сайт (Yandex Metrica, Google Analytics). 
                              Это помогает улучшать сайт.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleCategory('analytics')}
                          className={`flex-shrink-0 ml-4 w-12 h-6 rounded-full transition-colors relative ${
                            preferences.analytics ? 'bg-primary-purple' : 'bg-lavender-bg'
                          }`}
                          aria-label="Переключить аналитику"
                        >
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              preferences.analytics ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Маркетинг */}
                    <div className="bg-white rounded-xl p-5 border-2 border-lavender-bg hover:border-primary-purple/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Megaphone className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-body font-semibold text-deep-navy mb-1">
                              Маркетинг
                            </h4>
                            <p className="text-body-small text-deep-navy/70 mb-2">
                              Используются для показа релевантной рекламы и отслеживания эффективности рекламных кампаний.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleCategory('marketing')}
                          className={`flex-shrink-0 ml-4 w-12 h-6 rounded-full transition-colors relative ${
                            preferences.marketing ? 'bg-primary-purple' : 'bg-lavender-bg'
                          }`}
                          aria-label="Переключить маркетинг"
                        >
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              preferences.marketing ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Функциональные */}
                    <div className="bg-white rounded-xl p-5 border-2 border-lavender-bg hover:border-primary-purple/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Sliders className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-body font-semibold text-deep-navy mb-1">
                              Функциональные
                            </h4>
                            <p className="text-body-small text-deep-navy/70 mb-2">
                              Позволяют сайту запоминать ваши предпочтения (язык, регион, настройки) 
                              для более удобного использования.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleCategory('functional')}
                          className={`flex-shrink-0 ml-4 w-12 h-6 rounded-full transition-colors relative ${
                            preferences.functional ? 'bg-primary-purple' : 'bg-lavender-bg'
                          }`}
                          aria-label="Переключить функциональные"
                        >
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              preferences.functional ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-lavender-bg">
                    <button
                      onClick={handleRejectAll}
                      className="flex-1 px-6 py-3 bg-white border-2 border-lavender-bg text-deep-navy rounded-full font-semibold hover:bg-lavender-bg transition-colors"
                    >
                      Отклонить все
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="flex-1 px-6 py-3 bg-white border-2 border-primary-purple text-primary-purple rounded-full font-semibold hover:bg-primary-purple/5 transition-colors"
                    >
                      Принять все
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-lg transition-all"
                    >
                      Сохранить настройки
                    </button>
                  </div>

                  <p className="text-xs text-deep-navy/60 text-center mt-4">
                    Подробнее о том, как мы используем cookie, читайте в{' '}
                    <Link
                      href="/legal/cookies"
                      className="text-primary-purple hover:text-ocean-wave-start underline"
                    >
                      политике использования cookie
                    </Link>
                    {' '}и{' '}
                    <Link
                      href="/privacy"
                      className="text-primary-purple hover:text-ocean-wave-start underline"
                    >
                      политике конфиденциальности
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

