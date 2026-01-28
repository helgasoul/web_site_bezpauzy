'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Bot, MessageCircle, Lock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { RegisterModal } from '@/components/auth/RegisterModal'
import { WebsiteLoginModal } from '@/components/auth/WebsiteLoginModal'
import { TelegramLinkModal } from '@/components/auth/TelegramLinkModal'
import { ChatInterface } from './ChatInterface'

interface ChatAuthGateProps {
  user: {
    id: string
    telegramId: number | null
    email?: string
    subscriptionStatus?: string
    subscriptionPlan?: string
  } | null
  quizContext?: {
    quizType: 'inflammation' | 'mrs'
    level?: string
    score?: number
  }
  articleSlug?: string
}

export const ChatAuthGate: FC<ChatAuthGateProps> = ({ user, quizContext, articleSlug }) => {
  const router = useRouter()
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showWebsiteLogin, setShowWebsiteLogin] = useState(false)
  const [showTelegramLinkModal, setShowTelegramLinkModal] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [clientUser, setClientUser] = useState<typeof user>(user)

  // Если на сервере user = null, проверяем сессию на клиенте
  useEffect(() => {
    const checkClientSession = async () => {
      if (!user) {
        try {
          const response = await fetch('/api/auth/telegram/get-session')
          const data = await response.json()
          if (data.authenticated && data.user) {
            // Пользователь найден через клиентский API
            setClientUser({
              id: String(data.user.id),
              telegramId: data.user.telegramId || null,
              email: data.user.email,
              subscriptionStatus: data.user.isSubscribed ? 'active' : undefined,
              subscriptionPlan: data.user.subscriptionPlan,
            })
            console.log('[ChatAuthGate] User found via client API:', data.user)
          }
        } catch (error) {
          console.error('[ChatAuthGate] Error checking client session:', error)
        }
      } else {
        setClientUser(user)
      }
      setIsChecking(false)
    }

    checkClientSession()
    
    // Логируем данные пользователя для диагностики
    console.log('[ChatAuthGate] User data:', { 
      user, 
      hasUser: !!user, 
      hasTelegramId: user?.telegramId ? true : false,
      telegramId: user?.telegramId,
      subscriptionStatus: user?.subscriptionStatus 
    })
  }, [user])

  // Используем clientUser вместо user, если user = null
  const effectiveUser = clientUser || user

  // Если пользователь авторизован и имеет активную подписку
  if (effectiveUser && effectiveUser.subscriptionStatus === 'active') {
    console.log('[ChatAuthGate] User has active subscription, showing ChatInterface')
    // Показываем ChatInterface напрямую, если пользователь найден через клиентский API
    return (
      <ChatInterface 
        userId={effectiveUser.id} 
        telegramId={effectiveUser.telegramId || undefined}
        quizContext={quizContext}
        articleSlug={articleSlug}
      />
    )
  }

  // Если пользователь авторизован, но нет Telegram ID
  // Проверяем: telegramId может быть null, undefined или 0
  // ВАЖНО: Эта проверка должна быть ПЕРЕД проверкой подписки, чтобы показать привязку Telegram
  if (effectiveUser && (effectiveUser.telegramId === null || effectiveUser.telegramId === undefined || effectiveUser.telegramId === 0)) {
    return (
      <>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full space-y-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center mx-auto">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-h2 font-bold text-deep-navy">
              Привяжите Telegram для общения с Евой
            </h2>
            <p className="text-body text-deep-navy/70">
              Для общения с Евой на сайте необходимо привязать ваш Telegram аккаунт. Это позволит синхронизировать ваши диалоги между сайтом и ботом.
            </p>
            <div className="bg-lavender-bg rounded-2xl p-6 space-y-4">
              <h3 className="text-h4 font-semibold text-deep-navy">Преимущества привязки:</h3>
              <ul className="space-y-3 text-left">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                  <span className="text-body text-deep-navy/80">Синхронизация истории диалогов</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                  <span className="text-body text-deep-navy/80">Общение с Евой на сайте и в боте</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                  <span className="text-body text-deep-navy/80">Доступ к подписке из бота</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('[ChatAuthGate] Button clicked, opening TelegramLinkModal')
                  setShowTelegramLinkModal(true)
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300 cursor-pointer"
                type="button"
              >
                <Bot className="w-5 h-5" />
                Привязать Telegram
              </button>
            </div>
            <p className="text-sm text-deep-navy/60">
              Нажмите кнопку выше, чтобы привязать Telegram аккаунт
            </p>
          </motion.div>
        </div>
        <TelegramLinkModal
          isOpen={showTelegramLinkModal}
          onClose={() => {
            console.log('[ChatAuthGate] Closing TelegramLinkModal')
            setShowTelegramLinkModal(false)
          }}
          onSuccess={() => {
            console.log('[ChatAuthGate] Telegram link success, refreshing page')
            // Обновляем страницу для получения актуальных данных пользователя
            router.refresh()
          }}
        />
      </>
    )
  }

  // Если пользователь авторизован, но нет подписки
  if (effectiveUser && effectiveUser.subscriptionStatus !== 'active') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-h2 font-bold text-deep-navy">
            Для общения с Евой нужна подписка
          </h2>
          <p className="text-body text-deep-navy/70">
            Чтобы начать диалог с Евой на сайте, необходимо оформить подписку. Это даст вам неограниченный доступ к консультациям.
          </p>
          <div className="bg-lavender-bg rounded-2xl p-6 space-y-4">
            <h3 className="text-h4 font-semibold text-deep-navy">Что входит в подписку:</h3>
            <ul className="space-y-3 text-left">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                <span className="text-body text-deep-navy/80">Неограниченные вопросы Еве</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                <span className="text-body text-deep-navy/80">Персонализированные ответы на основе вашего возраста</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                <span className="text-body text-deep-navy/80">Рекомендации проверенных врачей</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                <span className="text-body text-deep-navy/80">Доступ к базе знаний и статьям</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                // TODO: Привязать к API оплаты через ЮКасса (n8n)
                // Пока что ведет на страницу оплаты или API endpoint
                // После реализации: будет вызывать /api/payment/subscribe
                window.location.href = '/payment/subscribe'
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              <span>Оплатить</span>
            </button>
          </div>
          <p className="text-sm text-deep-navy/60">
            После оплаты подписки вы сможете общаться с Евой на сайте
          </p>
        </motion.div>
      </div>
    )
  }

  // Если пользователь не авторизован
  // Ева доступна только в личном кабинете, поэтому нужна регистрация на сайте
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 sm:p-8 text-center overflow-y-auto">
      {isChecking ? (
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-6 py-6 sm:py-8 pb-10"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-h2 font-bold text-deep-navy">
            Зарегистрируйтесь, чтобы общаться с Евой
          </h2>
          <p className="text-body text-deep-navy/70">
            Для общения с Евой на сайте необходимо зарегистрироваться. Ева доступна только в личном кабинете. После регистрации вы сможете привязать Telegram для синхронизации с ботом.
          </p>
          <div className="bg-lavender-bg rounded-2xl p-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-purple/10 rounded-full mx-auto">
              <Sparkles className="w-4 h-4 text-primary-purple" />
              <span className="text-sm font-medium text-primary-purple">Безопасно и конфиденциально</span>
            </div>
            <ul className="space-y-3 text-left">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                <span className="text-body text-deep-navy/80">Сохранение истории диалогов</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                <span className="text-body text-deep-navy/80">Синхронизация с Telegram ботом</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                <span className="text-body text-deep-navy/80">Доступ к результатам квизов</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              Зарегистрироваться
            </button>
            <button
              onClick={() => setShowWebsiteLogin(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-white border-2 border-primary-purple text-primary-purple px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300"
            >
              <Lock className="w-5 h-5" />
              Уже зарегистрированы? Войти
            </button>
          </div>
          <p className="text-sm text-deep-navy/60">
            После регистрации вы сможете привязать Telegram и оформить подписку для общения с Евой
          </p>
        </motion.div>
      )}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          // Обновляем страницу для получения актуальных данных пользователя
          router.refresh()
        }}
        onSwitchToLogin={() => {
          setShowRegisterModal(false)
          setShowWebsiteLogin(true)
        }}
      />
      <WebsiteLoginModal
        isOpen={showWebsiteLogin}
        onClose={() => setShowWebsiteLogin(false)}
        onSuccess={() => {
          // Обновляем страницу для получения актуальных данных пользователя
          router.refresh()
        }}
        onSwitchToRegister={() => {
          setShowWebsiteLogin(false)
          setShowRegisterModal(true)
        }}
      />
      <TelegramLinkModal
        isOpen={showTelegramLinkModal}
        onClose={() => {
          console.log('[ChatAuthGate] Closing TelegramLinkModal')
          setShowTelegramLinkModal(false)
        }}
        onSuccess={() => {
          console.log('[ChatAuthGate] Telegram link success, refreshing page')
          // Обновляем страницу для получения актуальных данных пользователя
          router.refresh()
        }}
      />
    </div>
  )
}

