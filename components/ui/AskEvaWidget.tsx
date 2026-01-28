'use client'

import { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MessageCircle, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { RegisterModal } from '@/components/auth/RegisterModal'
import { WebsiteLoginModal } from '@/components/auth/WebsiteLoginModal'
import { TelegramLinkModal } from '@/components/auth/TelegramLinkModal'
import { assetUrl } from '@/lib/assets'

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
  const [hasEvaPhoto, setHasEvaPhoto] = useState(true) // Will be set to false if image fails to load

  // Check authentication status
  useEffect(() => {
    checkAuth()
  }, [])

  // Always show sidebar on desktop, hide on mobile until scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) {
        // Mobile: show after scroll
        if (window.scrollY > 400) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      } else {
        // Desktop: always visible
        setIsVisible(true)
      }
    }

    handleScroll() // Check on mount
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
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
    const { authenticated, subscription } = await checkAuth()

    if (authenticated) {
      // Зарегистрированный пользователь — переадресация в чат (в личном кабинете)
      router.push('/chat')
      setIsOpen(false)
    } else {
      // Не зарегистрирован — предлагаем регистрацию: на десктопе модалка, на мобильных панель
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setShowRegisterModal(true)
      } else {
        setIsOpen(true)
      }
    }
  }

  return (
    <>
      {/* Sticky Sidebar Widget - Desktop */}
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Desktop: Round sticky sidebar widget with photo */}
            <motion.div
              className="hidden lg:block fixed right-6 top-24 z-40"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-52 h-52 bg-gradient-to-br from-primary-purple via-primary-purple/90 to-ocean-wave-start rounded-full shadow-2xl border-4 border-white overflow-hidden hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 relative">
                  {/* Background Pattern — не перехватываем клики */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 0%, transparent 50%),
                                       radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0%, transparent 50%)`
                    }} />
                  </div>
                  
                {/* Eva Photo - только лицо, обрезано сверху; pointer-events-none чтобы клик шёл на overlay */}
                <div className="absolute inset-0 flex items-start justify-center pt-5 pointer-events-none">
                  {hasEvaPhoto ? (
                    <div className="relative w-28 h-28 rounded-full overflow-hidden ring-2 ring-white/40 shadow-2xl">
                      <Image
                        src={assetUrl('/eva-avatar.png')}
                        alt="Ева - AI-консультант"
                        fill
                        className="object-cover rounded-full"
                        sizes="112px"
                        priority
                        style={{ objectPosition: 'center 20%' }}
                        onError={() => {
                          setHasEvaPhoto(false)
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/40 shadow-xl">
                      <MessageCircle className="w-14 h-14 text-white" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                
                {/* Name and Title - внизу; pointer-events-none чтобы клик шёл на overlay */}
                <div className="absolute bottom-7 left-0 right-0 flex flex-col items-center justify-center px-3 z-10 pointer-events-none">
                  <div className="flex items-center gap-2 mb-0.5">
                    {/* Online Indicator - слева от имени */}
                    <div className="relative w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg" style={{ 
                      boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.8), 0 2px 8px rgba(34, 197, 94, 0.8), 0 0 12px rgba(34, 197, 94, 0.6)'
                    }} />
                    <h3 className="text-base font-bold text-white leading-tight drop-shadow-lg">Ева</h3>
                  </div>
                  <p className="text-[10px] text-white/95 leading-tight text-center drop-shadow-md">
                    AI-помощник
                  </p>
                </div>
                
                {/* Loading Indicator */}
                {isCheckingAuth && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                
                {/* Clickable Overlay поверх всего — принимает клики по всему аватару */}
                {!isCheckingAuth && (
                  <button
                    type="button"
                    onClick={handleAskEvaClick}
                    className="absolute inset-0 w-full h-full rounded-full cursor-pointer z-30"
                    aria-label="Спросить Еву"
                  />
                )}
              </div>
            </motion.div>

            {/* Mobile: Floating Button */}
            <AnimatePresence>
              {isVisible && !isOpen && (
                <motion.div
                  className="lg:hidden fixed right-6 bottom-6 z-50"
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
                    <div className="absolute inset-0 rounded-full bg-primary-purple animate-ping opacity-20" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Panel - Mobile */}
            <motion.div
              className="lg:hidden fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
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
                            href="/bot"
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

