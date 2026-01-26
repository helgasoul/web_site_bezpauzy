'use client'

import { FC, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  MessageCircle, 
  Video, 
  BookOpen, 
  Calendar, 
  Users, 
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  User,
  LogOut,
  Loader2,
  TrendingUp,
  Bookmark,
  Award,
  Sparkles,
  Heart,
  Play
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ForumSection } from './ForumSection'
import { QuizResultsSection } from './QuizResultsSection'
import { BackButton } from '@/components/ui/BackButton'
import { SavedVideos } from '@/components/account/SavedVideos'
import { SavedContent } from '@/components/account/SavedContent'
import { EventsCalendar } from '@/components/account/EventsCalendar'

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

interface CommunityDashboardProps {}

export const CommunityDashboard: FC<CommunityDashboardProps> = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'forum' | 'videos' | 'articles' | 'calendar' | 'quiz' | 'saved'>('forum')
  const [user, setUser] = useState<UserData | null>(null)
  
  // Check for tab query parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab && ['forum', 'videos', 'articles', 'calendar', 'quiz', 'saved'].includes(tab)) {
        setActiveTab(tab as 'forum' | 'videos' | 'articles' | 'calendar' | 'quiz' | 'saved')
      }
    }
  }, [])
  const [stats, setStats] = useState<UserStats>({
    quizCount: 0,
    savedVideosCount: 0,
    savedArticlesCount: 0,
    chatMessagesCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkSession = useCallback(async (retryCount = 0) => {
    const maxRetries = 3
    const retryDelay = 500
    
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
        }, 3000)
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
      }, 3000)
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

      // Получаем статистику сохраненного контента
      const contentResponse = await fetch('/api/account/saved-content', {
        credentials: 'include',
      })
      if (contentResponse.ok) {
        const contentData = await contentResponse.json()
        setStats(prev => ({ ...prev, savedArticlesCount: contentData.saved_content?.length || 0 }))
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-soft-white to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-purple animate-spin mx-auto mb-4" />
          <p className="text-body text-deep-navy/70">Загрузка личного кабинета...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-soft-white to-white">
        <div className="max-w-2xl mx-auto bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <h2 className="text-h3 font-bold text-red-600 mb-4">Ошибка при проверке сессии</h2>
          <p className="text-body text-red-700 mb-4">{error || 'Пользователь не найден'}</p>
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

  // Mock data - will be replaced with Supabase data
  const recentVideos = [
    {
      id: 1,
      title: 'Приливы: механизм и способы облегчения',
      thumbnail: '/hero-women.jpg',
      duration: '15:30',
      category: 'Гинекология',
    },
    {
      id: 2,
      title: 'Сон в менопаузе: как наладить',
      thumbnail: '/hero-women.jpg',
      duration: '12:45',
      category: 'Общее здоровье',
    },
  ]

  const recentArticles = [
    {
      id: 1,
      title: 'Приливы: причины и 10 способов облегчения',
      excerpt: 'Узнайте, почему возникают приливы и как можно облегчить этот симптом',
      slug: 'prilivy-prichiny-i-resheniya',
      readTime: 8,
    },
    {
      id: 2,
      title: 'ЗГТ: показания и противопоказания',
      excerpt: 'Полное руководство по заместительной гормональной терапии',
      slug: 'zgt-pokazaniya-i-protivopokazaniya',
      readTime: 12,
    },
  ]


  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary-purple via-ocean-wave-start to-warm-accent/30 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-pulse" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <BackButton variant="outline" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all"
              >
                <LogOut size={18} />
                <span>Выйти</span>
              </button>
            </div>
          </div>
          <div className="max-w-6xl mx-auto">
            {/* User Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/20 mb-8"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <User className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {user.username || (user.telegramId ? `Пользователь #${user.telegramId}` : 'Пользователь')}
                    </h1>
                    <div className="flex flex-wrap gap-4 text-sm text-white/80">
                      {user.ageRange && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
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
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:border-white/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stats.quizCount}</p>
                <p className="text-xs text-white/80">Пройдено квизов</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:border-white/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stats.savedVideosCount}</p>
                <p className="text-xs text-white/80">Сохранено видео</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:border-white/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stats.savedArticlesCount}</p>
                <p className="text-xs text-white/80">Сохранено статей</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:border-white/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stats.chatMessagesCount}</p>
                <p className="text-xs text-white/80">Сообщений Еве</p>
              </motion.div>
            </motion.div>

            {/* Subscription Status */}
            {(user.isSubscribed !== null || user.subscriptionPlan || user.paymentStatus) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Подписка</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {user.subscriptionPlan && (
                    <div>
                      <p className="text-xs text-white/70 mb-1">План</p>
                      <p className="text-base font-semibold text-white">{user.subscriptionPlan}</p>
                    </div>
                  )}
                  {user.isSubscribed !== null && (
                    <div>
                      <p className="text-xs text-white/70 mb-1">Статус</p>
                      <p className={`text-base font-semibold ${user.isSubscribed ? 'text-green-300' : 'text-white/70'}`}>
                        {user.isSubscribed ? 'Активна' : 'Неактивна'}
                      </p>
                    </div>
                  )}
                  {user.paymentStatus && (
                    <div>
                      <p className="text-xs text-white/70 mb-1">Платеж</p>
                      <p className="text-base font-semibold text-white">{user.paymentStatus}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
                <Users className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">Добро пожаловать в сообщество</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4 drop-shadow-lg">
                Ваш личный кабинет
              </h2>
              <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
                Здесь собраны все ресурсы сообщества «Без паузы» для вашего удобства
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Tabs Navigation */}
            <div className="mb-12">
              <div className="flex flex-wrap gap-4 justify-center border-b border-lavender-bg">
                <button
                  onClick={() => setActiveTab('forum')}
                  className={`px-6 py-4 text-lg font-semibold transition-colors border-b-2 ${
                    activeTab === 'forum'
                      ? 'text-primary-purple border-primary-purple'
                      : 'text-deep-navy/60 border-transparent hover:text-primary-purple'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Форум</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-6 py-4 text-lg font-semibold transition-colors border-b-2 ${
                    activeTab === 'videos'
                      ? 'text-primary-purple border-primary-purple'
                      : 'text-deep-navy/60 border-transparent hover:text-primary-purple'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    <span>Видео</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`px-6 py-4 text-lg font-semibold transition-colors border-b-2 ${
                    activeTab === 'articles'
                      ? 'text-primary-purple border-primary-purple'
                      : 'text-deep-navy/60 border-transparent hover:text-primary-purple'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Статьи</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`px-6 py-4 text-lg font-semibold transition-colors border-b-2 ${
                    activeTab === 'calendar'
                      ? 'text-primary-purple border-primary-purple'
                      : 'text-deep-navy/60 border-transparent hover:text-primary-purple'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>Календарь</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px-6 py-4 text-lg font-semibold transition-colors border-b-2 ${
                    activeTab === 'quiz'
                      ? 'text-primary-purple border-primary-purple'
                      : 'text-deep-navy/60 border-transparent hover:text-primary-purple'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    <span>Мои результаты</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-6 py-4 text-lg font-semibold transition-colors border-b-2 ${
                    activeTab === 'saved'
                      ? 'text-primary-purple border-primary-purple'
                      : 'text-deep-navy/60 border-transparent hover:text-primary-purple'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-5 h-5" />
                    <span>Сохранено</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mt-8">
              {/* Forum Tab */}
              {activeTab === 'forum' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ForumSection />
                </motion.div>
              )}

              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="mb-8">
                    <h2 className="text-h2 font-bold text-deep-navy mb-4">
                      Видео библиотека
                    </h2>
                    <p className="text-body text-deep-navy/70">
                      Смотрите записи вебинаров и обучающие видео от наших экспертов
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentVideos.map((video) => (
                      <div
                        key={video.id}
                        className="bg-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300"
                      >
                        <div className="relative w-full h-48 bg-gradient-to-br from-primary-purple/40 to-ocean-wave-start/40">
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-4">
                          <span className="text-xs text-primary-purple font-semibold mb-2 block">
                            {video.category}
                          </span>
                          <h3 className="text-h5 font-semibold text-deep-navy mb-2 line-clamp-2">
                            {video.title}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Articles Tab */}
              {activeTab === 'articles' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="mb-8">
                    <h2 className="text-h2 font-bold text-deep-navy mb-4">
                      Статьи сообщества
                    </h2>
                    <p className="text-body text-deep-navy/70 mb-4">
                      Научно обоснованные статьи от экспертов
                    </p>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-2 text-primary-purple hover:underline font-semibold"
                    >
                      <span>Смотреть все статьи</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/bot"
                      className="inline-flex items-center gap-2 text-ocean-wave-start hover:underline font-semibold"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Чат с Евой</span>
                    </Link>
                  </div>
                </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/blog/${article.slug}`}
                        className="bg-white rounded-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group"
                      >
                        <h3 className="text-h4 font-semibold text-deep-navy mb-3 group-hover:text-primary-purple transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-body text-deep-navy/70 mb-4 line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-caption text-deep-navy/60">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{article.readTime} мин</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Calendar Tab */}
              {activeTab === 'calendar' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="mb-8">
                    <h2 className="text-h2 font-bold text-deep-navy mb-4">
                      Календарь событий
                    </h2>
                    <p className="text-body text-deep-navy/70">
                      Запланируйте участие в предстоящих событиях. Добавьте события в свой календарь, чтобы не пропустить.
                    </p>
                  </div>
                  <EventsCalendar userId={user.id} />
                </motion.div>
              )}

              {/* Quiz Results Tab */}
              {activeTab === 'quiz' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <QuizResultsSection />
                </motion.div>
              )}

              {/* Saved Tab */}
              {activeTab === 'saved' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Saved Content Section */}
                  <div>
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
                  </div>

                  {/* Saved Videos Section */}
                  <div>
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
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

