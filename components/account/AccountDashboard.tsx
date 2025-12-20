'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, FileText, MessageCircle, LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserData {
  id: string
  telegramId: number | null
  email: string | null
  username: string | null
  ageRange: string | null
  city: string | null
  subscriptionStatus: string | null
  subscriptionPlan: string | null
}

export const AccountDashboard: FC = () => {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async (retryCount = 0) => {
    try {
      console.log(`Checking session (attempt ${retryCount + 1})...`)
      const response = await fetch('/api/auth/telegram/get-session', {
        cache: 'no-store', // Не кешируем запрос, чтобы получить актуальную сессию
        credentials: 'include', // Включаем cookies в запрос
      })
      const data = await response.json()
      console.log('Session check response:', data)

      if (!data.authenticated) {
        // Если сессия не найдена, но это первая попытка - пробуем еще раз через 300ms
        // Это помогает, если cookie еще не успела установиться после входа
        if (retryCount < 2) {
          setTimeout(() => {
            checkSession(retryCount + 1)
          }, 300)
          return
        }
        // Если после повторных попыток сессия все еще не найдена - редирект на главную
        router.push('/')
        return
      }

      setUser(data.user)
      setLoading(false)
    } catch (error) {
      console.error('Error checking session:', error)
      // При ошибке тоже пробуем повторить один раз
      if (retryCount < 1) {
        setTimeout(() => {
          checkSession(retryCount + 1)
        }, 300)
        return
      }
      router.push('/')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/telegram/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-primary-purple animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-deep-navy mb-2">Личный кабинет</h1>
          <p className="text-body text-deep-navy/70">
            Управляйте своим аккаунтом и отслеживайте прогресс
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-br from-primary-purple/10 via-ocean-wave-start/10 to-warm-accent/10 rounded-3xl p-8 md:p-10 border-2 border-primary-purple/20 shadow-lg mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-h3 font-bold text-deep-navy">
                {user.username || user.email || (user.telegramId ? `Пользователь #${user.telegramId}` : 'Пользователь')}
              </h2>
              {user.ageRange && (
                <p className="text-body text-deep-navy/70">Возраст: {user.ageRange}</p>
              )}
              {user.city && (
                <p className="text-body text-deep-navy/70">Город: {user.city}</p>
              )}
            </div>
          </div>

          {user.subscriptionStatus && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-sm font-medium text-deep-navy mb-1">Подписка</p>
              <p className="text-body text-deep-navy/70">
                {user.subscriptionPlan || user.subscriptionStatus}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/account/quiz-results">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl p-6 border-2 border-lavender-bg hover:border-primary-purple/30 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary-purple/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-purple" />
                </div>
                <h3 className="text-h5 font-bold text-deep-navy">Результаты квизов</h3>
              </div>
              <p className="text-body text-deep-navy/70">
                Просмотрите историю ваших результатов и отслеживайте изменения
              </p>
            </motion.div>
          </Link>

          <Link href="/chat">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-2xl p-6 border-2 border-lavender-bg hover:border-primary-purple/30 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-ocean-wave-start/10 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-ocean-wave-start" />
                </div>
                <h3 className="text-h5 font-bold text-deep-navy">Чат с Евой</h3>
              </div>
              <p className="text-body text-deep-navy/70">
                Задайте вопросы ассистенту Еве и получите персональные рекомендации
              </p>
            </motion.div>
          </Link>
        </div>

        {/* Logout Button */}
        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 text-body font-medium text-deep-navy/70 hover:text-error transition-colors"
          >
            <LogOut size={18} />
            <span>Выйти из аккаунта</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}


