'use client'

import { FC, useState } from 'react'
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
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ForumSection } from './ForumSection'
import { QuizResultsSection } from './QuizResultsSection'
import { BackButton } from '@/components/ui/BackButton'

interface CommunityDashboardProps {}

export const CommunityDashboard: FC<CommunityDashboardProps> = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'forum' | 'videos' | 'articles' | 'calendar' | 'quiz'>('forum')

  // Mock data - will be replaced with Supabase data
  const upcomingWebinars = [
    {
      id: 1,
      title: 'ЗГТ: все что нужно знать',
      date: '2024-12-20',
      time: '19:00',
      duration: '60 мин',
      speaker: 'Др. Анна Иванова',
      description: 'Разберем показания, противопоказания и альтернативы ЗГТ',
      googleCalendarLink: '#',
    },
    {
      id: 2,
      title: 'Питание в менопаузе: практические советы',
      date: '2024-12-27',
      time: '19:00',
      duration: '45 мин',
      speaker: 'Др. Мария Петрова',
      description: 'Как правильно питаться для поддержания веса и энергии',
      googleCalendarLink: '#',
    },
  ]

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const addToGoogleCalendar = (webinar: typeof upcomingWebinars[0]) => {
    // Generate Google Calendar link
    const startDate = new Date(`${webinar.date}T${webinar.time}`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // +1 hour
    
    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: webinar.title,
      dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
      details: webinar.description,
      location: 'Онлайн (ссылка будет отправлена на email)',
    })

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank')
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary-purple via-ocean-wave-start to-warm-accent/30 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-pulse" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <BackButton variant="outline" />
            </div>
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
              <Users className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">Добро пожаловать в сообщество</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-montserrat mb-6 drop-shadow-lg">
              Ваш личный кабинет
            </h1>
            <p className="text-xl md:text-2xl text-white/95 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
              Здесь собраны все ресурсы сообщества «Без паузы» для вашего удобства
            </p>
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
                    <Link
                      href="/blog"
                      className="inline-flex items-center gap-2 text-primary-purple hover:underline font-semibold"
                    >
                      <span>Смотреть все статьи</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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
                      Календарь вебинаров
                    </h2>
                    <p className="text-body text-deep-navy/70">
                      Запланируйте участие в предстоящих вебинарах. Добавьте события в свой Google Calendar, чтобы не пропустить.
                    </p>
                  </div>
                  <div className="space-y-6">
                    {upcomingWebinars.map((webinar) => (
                      <div
                        key={webinar.id}
                        className="bg-white rounded-card p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                          {/* Date Card */}
                          <div className="flex-shrink-0">
                            <div className="bg-gradient-to-br from-primary-purple to-ocean-wave-start text-white rounded-card p-6 text-center min-w-[120px]">
                              <div className="text-3xl font-bold mb-1">
                                {new Date(webinar.date).getDate()}
                              </div>
                              <div className="text-sm uppercase">
                                {new Date(webinar.date).toLocaleDateString('ru-RU', { month: 'short' })}
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="text-h3 font-semibold text-deep-navy mb-3">
                              {webinar.title}
                            </h3>
                            <p className="text-body text-deep-navy/70 mb-4">
                              {webinar.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-body-small text-deep-navy/60 mb-4">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{webinar.time} ({webinar.duration})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>Онлайн</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{webinar.speaker}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => addToGoogleCalendar(webinar)}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-primary-purple text-primary-purple rounded-full font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300"
                            >
                              <Calendar className="w-5 h-5" />
                              <span>Добавить в Google Calendar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Google Calendar Sync Info */}
                  <div className="bg-lavender-bg rounded-card p-6 mt-8">
                    <div className="flex items-start gap-4">
                      <CheckCircle2 className="w-6 h-6 text-primary-purple flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-h5 font-semibold text-deep-navy mb-2">
                          Синхронизация с Google Calendar
                        </h4>
                        <p className="text-body text-deep-navy/70 mb-4">
                          Нажмите "Добавить в Google Calendar" рядом с интересующим вебинаром, и событие автоматически появится в вашем календаре. Вы получите напоминание за день до вебинара.
                        </p>
                        <p className="text-body-small text-deep-navy/60">
                          💡 <strong>Совет:</strong> Вы можете подписаться на календарь сообщества, чтобы все новые вебинары автоматически появлялись в вашем Google Calendar. Ссылка на подписку будет доступна в ближайшее время.
                        </p>
                      </div>
                    </div>
                  </div>
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
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

