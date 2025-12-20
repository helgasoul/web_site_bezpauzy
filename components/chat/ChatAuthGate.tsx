'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, MessageCircle, Lock, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { RegisterModal } from '@/components/auth/RegisterModal'
import { WebsiteLoginModal } from '@/components/auth/WebsiteLoginModal'

interface ChatAuthGateProps {
  user: {
    id: string
    telegramId: number | null
    email?: string
    subscriptionStatus?: string
    subscriptionPlan?: string
  } | null
}

export const ChatAuthGate: FC<ChatAuthGateProps> = ({ user }) => {
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showWebsiteLogin, setShowWebsiteLogin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Небольшая задержка для плавного появления
    setTimeout(() => setIsChecking(false), 500)
  }, [])

  // Если пользователь авторизован и имеет активную подписку
  if (user && user.subscriptionStatus === 'active') {
    return null // Показываем чат
  }

  // Если пользователь авторизован, но нет Telegram ID
  if (user && (!user.telegramId || user.telegramId === 0)) {
    return (
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
            <Link
              href="/account"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Bot className="w-5 h-5" />
              Привязать Telegram
            </Link>
          </div>
          <p className="text-sm text-deep-navy/60">
            Перейдите в личный кабинет, чтобы привязать Telegram аккаунт
          </p>
        </motion.div>
      </div>
    )
  }

  // Если пользователь авторизован, но нет подписки
  if (user && user.subscriptionStatus !== 'active') {
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
            <Link
              href="https://t.me/bezpauzy_bot?start=website_chat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              <Bot className="w-5 h-5" />
              Открыть бота для оплаты
            </Link>
          </div>
          <p className="text-sm text-deep-navy/60">
            После оплаты подписки в боте вы сможете общаться с Евой на сайте
          </p>
        </motion.div>
      </div>
    )
  }

  // Если пользователь не авторизован
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {isChecking ? (
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary-purple border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-6"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-h2 font-bold text-deep-navy">
            Войдите, чтобы общаться с Евой
          </h2>
          <p className="text-body text-deep-navy/70">
            Для общения с Евой на сайте необходимо зарегистрироваться или войти в аккаунт. Это позволит сохранять историю диалогов и синхронизировать данные с Telegram ботом.
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
              Войти через логин/пароль
            </button>
          </div>
          <p className="text-sm text-deep-navy/60">
            Зарегистрируйтесь, чтобы сохранять результаты квизов и общаться с Евой
          </p>
        </motion.div>
      )}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          // Перезагружаем страницу после успешной регистрации
          window.location.reload()
        }}
      />
      <WebsiteLoginModal
        isOpen={showWebsiteLogin}
        onClose={() => setShowWebsiteLogin(false)}
        onSuccess={() => {
          // Перезагружаем страницу после успешного входа
          window.location.reload()
        }}
        onSwitchToRegister={() => {
          setShowWebsiteLogin(false)
          setShowRegisterModal(true)
        }}
      />
    </div>
  )
}

