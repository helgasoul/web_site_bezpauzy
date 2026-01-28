'use client'

import { FC, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  User, FileText, MessageCircle, LogOut, Loader2, 
  Play, Bookmark, TrendingUp, Award, Sparkles, 
  Calendar, BarChart3, Heart, Video
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/ui/BackButton'
import { SavedVideos } from './SavedVideos'
import { EventsCalendar } from './EventsCalendar'
import { SavedContent } from './SavedContent'
import { PurchasedItems } from './PurchasedItems'

interface UserData {
  id: string
  telegramId: number | null
  username: string | null
  ageRange: string | null
  city: string | null
  isSubscribed: boolean | null
  subscriptionPlan: string | null
  paymentStatus: string | null
}

interface UserStats {
  quizCount: number
  savedVideosCount: number
  savedArticlesCount: number
  chatMessagesCount: number
}

export const AccountDashboard: FC = () => {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<UserStats>({
    quizCount: 0,
    savedVideosCount: 0,
    savedArticlesCount: 0,
    chatMessagesCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkSession = useCallback(async (retryCount = 0) => {
    const maxRetries = 10
    const retryDelay = 800
    
    try {
      const response = await fetch('/api/auth/telegram/get-session', {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()

      if (!data.authenticated) {
        if (retryCount < maxRetries - 1) {
          setTimeout(() => {
            checkSession(retryCount + 1)
          }, retryDelay)
          return
        }
        setError(data.error || 'Сессия не найдена')
        setLoading(false)
        setTimeout(() => {
          router.push('/')
        }, 5000)
        return
      }

      setUser(data.user)
      setLoading(false)
    } catch (error: any) {
      if (retryCount < maxRetries - 1) {
        setTimeout(() => {
          checkSession(retryCount + 1)
        }, retryDelay)
        return
      }
      setError(error.message || 'Неизвестная ошибка')
      setLoading(false)
      setTimeout(() => {
        router.push('/')
      }, 5000)
    }
  }, [router])

  const fetchStats = useCallback(async () => {
    if (!user) return
    
    try {
      // Получаем статистику квизов
      const quizResponse = await fetch('/api/quiz/get-results', {
        credentials: 'include',
      })
      if (quizResponse.ok) {
        const quizData = await quizResponse.json()
        setStats(prev => ({ ...prev, quizCount: quizData.results?.length || 0 }))
      }

      // Получаем статистику сохраненных видео
      const videosResponse = await fetch(`/api/account/saved-videos?userId=${user.id}`, {
        credentials: 'include',
      })
      if (videosResponse.ok) {
        const videosData = await videosResponse.json()
        setStats(prev => ({ ...prev, savedVideosCount: videosData.count || 0 }))
      }
    } catch (err) {
      // Игнорируем ошибки статистики
    }
  }, [user])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user, fetchStats])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/telegram/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="w-8 h-8 text-primary-purple animate-spin" />
          <p className="text-body text-deep-navy/70">Проверка сессии...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-2xl mx-auto bg-red-50 border-2 border-red-200 rounded-2xl p-8">
          <h2 className="text-h3 font-bold text-red-600 mb-4">Ошибка при проверке сессии</h2>
          <p className="text-body text-red-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header with gradient background */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mb-8 rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-purple via-ocean-wave-start to-warm-accent opacity-10" />
            <div className="relative bg-gradient-to-br from-primary-purple/5 via-ocean-wave-start/5 to-warm-accent/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border-2 border-primary-purple/20">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="w-20 h-20 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-3xl flex items-center justify-center shadow-lg"
                  >
                    <User className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-h1 font-bold text-deep-navy mb-2">
                      {user.username || (user.telegramId ? `Пользователь #${user.telegramId}` : 'Пользователь')}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-body text-deep-navy/70">
                      {user.ageRange && (
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {user.ageRange}
                        </span>
                      )}
                      {user.city && (
                        <span className="flex items-center gap-1">
                          📍 {user.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-6 py-3 text-body font-medium text-deep-navy/70 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                >
                  <LogOut size={18} />
                  <span>Выйти</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 border-2 border-lavender-bg hover:border-primary-purple/30 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-primary-purple/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-purple" />
                </div>
                <TrendingUp className="w-5 h-5 text-primary-purple/50" />
              </div>
              <p className="text-3xl font-bold text-deep-navy mb-1">{stats.quizCount}</p>
              <p className="text-sm text-deep-navy/70">Пройдено квизов</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 border-2 border-lavender-bg hover:border-ocean-wave-start/30 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-ocean-wave-start/10 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-ocean-wave-start" />
                </div>
                <Bookmark className="w-5 h-5 text-ocean-wave-start/50" />
              </div>
              <p className="text-3xl font-bold text-deep-navy mb-1">{stats.savedVideosCount}</p>
              <p className="text-sm text-deep-navy/70">Сохранено видео</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 border-2 border-lavender-bg hover:border-warm-accent/30 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-warm-accent/10 rounded-xl flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-warm-accent" />
                </div>
                <Heart className="w-5 h-5 text-warm-accent/50" />
              </div>
              <p className="text-3xl font-bold text-deep-navy mb-1">{stats.savedArticlesCount}</p>
              <p className="text-sm text-deep-navy/70">Сохранено статей</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 border-2 border-lavender-bg hover:border-primary-purple/30 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-primary-purple/10 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary-purple" />
                </div>
                <Sparkles className="w-5 h-5 text-primary-purple/50" />
              </div>
              <p className="text-3xl font-bold text-deep-navy mb-1">{stats.chatMessagesCount}</p>
              <p className="text-sm text-deep-navy/70">Сообщений Еве</p>
            </motion.div>
          </motion.div>

          {/* Subscription Status */}
          {(user.isSubscribed !== null || user.subscriptionPlan || user.paymentStatus) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10 rounded-2xl p-6 border-2 border-primary-purple/20 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-primary-purple" />
                <h2 className="text-h4 font-bold text-deep-navy">Подписка</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {user.subscriptionPlan && (
                  <div>
                    <p className="text-sm text-deep-navy/70 mb-1">План</p>
                    <p className="text-body font-semibold text-deep-navy">{user.subscriptionPlan}</p>
                  </div>
                )}
                {user.isSubscribed !== null && (
                  <div>
                    <p className="text-sm text-deep-navy/70 mb-1">Статус</p>
                    <p className={`text-body font-semibold ${user.isSubscribed ? 'text-green-600' : 'text-deep-navy/70'}`}>
                      {user.isSubscribed ? 'Активна' : 'Неактивна'}
                    </p>
                  </div>
                )}
                {user.paymentStatus && (
                  <div>
                    <p className="text-sm text-deep-navy/70 mb-1">Платеж</p>
                    <p className="text-body font-semibold text-deep-navy">{user.paymentStatus}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <Link href="/account/quiz-results">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-6 border-2 border-lavender-bg hover:border-primary-purple/30 transition-all shadow-sm hover:shadow-lg group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-purple/20 to-primary-purple/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7 text-primary-purple" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-h5 font-bold text-deep-navy mb-1">Результаты квизов</h3>
                    <p className="text-sm text-deep-navy/60">История и прогресс</p>
                  </div>
                  <BarChart3 className="w-5 h-5 text-primary-purple/50 group-hover:text-primary-purple transition-colors" />
                </div>
                <p className="text-body text-deep-navy/70">
                  Просмотрите историю ваших результатов и отслеживайте изменения
                </p>
              </motion.div>
            </Link>

            <Link href="/chat">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-2xl p-6 border-2 border-lavender-bg hover:border-ocean-wave-start/30 transition-all shadow-sm hover:shadow-lg group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-ocean-wave-start/20 to-ocean-wave-start/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-7 h-7 text-ocean-wave-start" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-h5 font-bold text-deep-navy mb-1">Чат с Евой</h3>
                    <p className="text-sm text-deep-navy/60">AI-консультант</p>
                  </div>
                  <Sparkles className="w-5 h-5 text-ocean-wave-start/50 group-hover:text-ocean-wave-start transition-colors" />
                </div>
                <p className="text-body text-deep-navy/70">
                  Задайте вопросы ассистенту Еве и получите персональные рекомендации
                </p>
              </motion.div>
            </Link>
          </motion.div>

          {/* Events Calendar Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-8"
          >
            <EventsCalendar userId={user.id} />
          </motion.div>

          {/* Saved Content Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-purple/20 to-warm-accent/20 rounded-xl flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-primary-purple" />
                </div>
                <div>
                  <h2 className="text-h3 font-bold text-deep-navy">Сохраненный контент</h2>
                  <p className="text-sm text-deep-navy/60">Ваша подборка статей, квизов и чек-листов</p>
                </div>
              </div>
            </div>
            <SavedContent />
          </motion.div>

          {/* Purchased Items Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-warm-accent/20 to-primary-purple/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-warm-accent" />
                </div>
                <div>
                  <h2 className="text-h3 font-bold text-deep-navy">Мои покупки</h2>
                  <p className="text-sm text-deep-navy/60">Купленные книги и гайды с доступными ссылками</p>
                </div>
              </div>
            </div>
            <PurchasedItems />
          </motion.div>

          {/* Saved Videos Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-purple/20 to-ocean-wave-start/20 rounded-xl flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary-purple" />
                </div>
                <div>
                  <h2 className="text-h3 font-bold text-deep-navy">Сохраненные видео</h2>
                  <p className="text-sm text-deep-navy/60">Ваша персональная подборка</p>
                </div>
              </div>
              <Link
                href="/videos"
                className="text-sm text-primary-purple hover:text-ocean-wave-start font-medium transition-colors flex items-center gap-1"
              >
                Все видео
                <span>→</span>
              </Link>
            </div>
            <SavedVideos />
          </motion.div>

          {/* Additional Features Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-lavender-bg rounded-2xl p-8 text-center"
          >
            <Sparkles className="w-12 h-12 text-primary-purple/30 mx-auto mb-4" />
            <h3 className="text-h5 font-semibold text-deep-navy mb-2">
              Больше возможностей скоро
            </h3>
            <p className="text-body text-deep-navy/70 mb-4">
              Мы работаем над добавлением новых функций: сохраненные статьи, история активности, персональные рекомендации
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-white rounded-full text-sm text-deep-navy/70">Сохраненные статьи</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm text-deep-navy/70">История активности</span>
              <span className="px-4 py-2 bg-white rounded-full text-sm text-deep-navy/70">Рекомендации</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
