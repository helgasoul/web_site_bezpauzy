'use client'

import { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { RegisterModal } from '@/components/auth/RegisterModal'
import { WebsiteLoginModal } from '@/components/auth/WebsiteLoginModal'
import { TelegramLinkModal } from '@/components/auth/TelegramLinkModal'

interface AskEvaWidgetProps {
  articleTitle?: string
  articleSlug?: string
}

export const AskEvaWidget: FC<AskEvaWidgetProps> = ({ articleTitle, articleSlug }) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showWebsiteLogin, setShowWebsiteLogin] = useState(false)
  const [showTelegramLink, setShowTelegramLink] = useState(false)
  const [userTelegramId, setUserTelegramId] = useState<number | null>(null)

  // Check authentication status
  useEffect(() => {
    checkAuth()
  }, [])

  // Show widget after user scrolls down a bit
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/telegram/get-session')
      const data = await response.json()
      const authenticated = data.authenticated || false
      const subscription = data.user?.subscriptionStatus === 'active' || false
      const telegramId = data.user?.telegramId || null
      setIsAuthenticated(authenticated)
      setHasSubscription(subscription)
      setUserTelegramId(telegramId)
      return { authenticated, subscription, telegramId }
    } catch (error) {
      setIsAuthenticated(false)
      setHasSubscription(false)
      setUserTelegramId(null)
      return { authenticated: false, subscription: false, telegramId: null }
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleAskEvaClick = async () => {
    // Всегда проверяем авторизацию перед открытием виджета
    const { authenticated, subscription } = await checkAuth()

    if (authenticated && subscription) {
      // Пользователь авторизован и имеет подписку - открываем чат
      router.push('/chat')
      setIsOpen(false)
    } else if (authenticated && !subscription) {
      // Пользователь авторизован, но нет подписки - открываем чат (там покажется сообщение о подписке)
      router.push('/chat')
      setIsOpen(false)
    } else {
      // Пользователь не авторизован - показываем виджет с кнопками регистрации/входа
      setIsOpen(true)
    }
  }

  return (
    <>
      {/* Floating Button - triggers the widget */}
      <AnimatePresence>
        {isVisible && !isOpen && (
          <motion.div
            className="fixed right-6 bottom-6 z-50"
            initial={{ opacity: 0, scale: 0.8, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleAskEvaClick}
              className="group relative w-16 h-16 bg-gradient-primary rounded-full shadow-strong flex items-center justify-center hover:scale-110 transition-transform duration-300"
              aria-label="Спросить Еву"
            >
              <MessageCircle className="w-8 h-8 text-white" />
              
              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-full bg-primary-purple animate-ping opacity-20" />
              
              {/* Tooltip on hover */}
              <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-deep-navy text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                  Спросить Еву
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-deep-navy" />
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Widget */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6 md:p-8 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-h5 font-semibold text-deep-navy">Ева</h3>
                      <p className="text-caption text-deep-navy/60">Онлайн</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-lavender-bg rounded-full transition-colors"
                    aria-label="Закрыть"
                  >
                    <X className="w-5 h-5 text-deep-navy" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-purple/10 rounded-full">
                      <Sparkles className="w-4 h-4 text-primary-purple" />
                      <span className="text-sm font-medium text-primary-purple">AI-консультант</span>
                    </div>

                    <h4 className="text-h4 font-semibold text-deep-navy">
                      Остались вопросы?
                    </h4>

                    <p className="text-body text-deep-navy/70">
                      {articleTitle
                        ? `Спросите Еву о "${articleTitle}" — она ответит с учётом вашей ситуации.`
                        : 'Спросите Еву в ассистенте — она ответит на основе научных источников и вашей истории.'}
                    </p>

                    <div className="bg-lavender-bg rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-deep-navy/70">
                        <span className="w-2 h-2 bg-primary-purple rounded-full" />
                        <span>Ответы на основе науки</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-deep-navy/70">
                        <span className="w-2 h-2 bg-primary-purple rounded-full" />
                        <span>Персонализированные ответы</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-deep-navy/70">
                        <span className="w-2 h-2 bg-primary-purple rounded-full" />
                        <span>Конфиденциально и безопасно</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  {isCheckingAuth ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-primary-purple border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : isAuthenticated ? (
                    <>
                      {userTelegramId && userTelegramId !== 0 ? (
                        <>
                          <Link
                            href="/chat"
                            className="block w-full"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="w-full bg-gradient-primary text-white px-6 py-4 rounded-full text-center font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300">
                              Спросить Еву →
                            </div>
                          </Link>
                          <p className="text-caption text-deep-navy/60 text-center">
                            Откроется чат на сайте
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-deep-navy/70 text-center mb-4">
                            Чтобы общаться с Евой, привяжите ваш Telegram аккаунт. Это позволит синхронизировать диалоги между сайтом и ботом.
                          </p>
                          <button
                            onClick={() => {
                              setShowTelegramLink(true)
                              setIsOpen(false)
                            }}
                            className="w-full bg-gradient-primary text-white px-6 py-4 rounded-full text-center font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Синхронизировать с Telegram
                          </button>
                          <p className="text-xs text-deep-navy/60 text-center mt-2">
                            После привязки вы сможете общаться с Евой на сайте
                          </p>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setShowRegisterModal(true)
                          setIsOpen(false)
                        }}
                        className="w-full bg-gradient-primary text-white px-6 py-4 rounded-full text-center font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300"
                      >
                        Зарегистрироваться
                      </button>
                      <button
                        onClick={() => {
                          setShowWebsiteLogin(true)
                          setIsOpen(false)
                        }}
                        className="w-full bg-white border-2 border-primary-purple text-primary-purple px-6 py-3 rounded-full text-center font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300"
                      >
                        Войти через логин/пароль
                      </button>
                      <p className="text-caption text-deep-navy/60 text-center">
                        Зарегистрируйтесь, чтобы общаться с Евой
                      </p>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-lavender-bg">
                  <p className="text-caption text-deep-navy/60 text-center">
                    Ева доступна 24/7
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auth Modals */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false)
          checkAuth()
        }}
        onSuccess={() => {
          setShowRegisterModal(false)
          checkAuth().then(({ telegramId }) => {
            // После регистрации проверяем telegram_id
            if (!telegramId || telegramId === 0) {
              // Показываем виджет с кнопкой синхронизации
              setIsOpen(true)
            } else {
              // Есть telegram_id - можно переходить в чат
              router.push('/chat')
            }
          })
        }}
      />
      <WebsiteLoginModal
        isOpen={showWebsiteLogin}
        onClose={() => {
          setShowWebsiteLogin(false)
          checkAuth()
        }}
        onSuccess={() => {
          setShowWebsiteLogin(false)
          checkAuth().then(({ telegramId }) => {
            // После входа проверяем telegram_id
            if (!telegramId || telegramId === 0) {
              // Показываем кнопку синхронизации
              setIsOpen(true)
            } else {
              // Есть telegram_id - можно переходить в чат
              router.push('/chat')
            }
          })
        }}
        onSwitchToRegister={() => {
          setShowWebsiteLogin(false)
          setShowRegisterModal(true)
        }}
      />
      <TelegramLinkModal
        isOpen={showTelegramLink}
        onClose={() => {
          setShowTelegramLink(false)
          checkAuth()
        }}
        onSuccess={() => {
          setShowTelegramLink(false)
          checkAuth().then(() => {
            // После привязки можно переходить в чат
            router.push('/chat')
          })
        }}
      />
    </>
  )
}

