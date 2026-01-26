'use client'

import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, TrendingUp, Activity, Calendar, RefreshCcw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface QuizCardProps {
  id: string
  title: string
  description: string
  category: string
  duration: string
  questionsCount: number
  iconName: 'activity' | 'trending-up'
  gradientFrom: string
  gradientTo: string
  href: string
  index: number
}

interface QuizHistoryResult {
  id: string
  totalScore: number
  severity: string
  createdAt: string
  formattedDate: string
}

const iconMap = {
  activity: Activity,
  'trending-up': TrendingUp,
}

export const QuizCard: FC<QuizCardProps> = ({
  id,
  title,
  description,
  category,
  duration,
  questionsCount,
  iconName,
  gradientFrom,
  gradientTo,
  href,
  index,
}) => {
  const Icon = iconMap[iconName]
  const [history, setHistory] = useState<QuizHistoryResult[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Определяем тип теста по id
  const testType = id === 'mrs' ? 'mrs' : 'inflammation'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Проверяем сессию
        const sessionResponse = await fetch('/api/auth/telegram/get-session')
        const sessionData = await sessionResponse.json()
        setIsAuthenticated(sessionData.authenticated)

        if (sessionData.authenticated) {
          const response = await fetch(`/api/quiz/history?testType=${testType}`)
          const data = await response.json()
          if (data.results && data.results.length > 0) {
            const formatted = data.results.map((result: any) => ({
              id: result.id,
              totalScore: result.totalScore,
              severity: result.severity,
              createdAt: result.createdAt,
              formattedDate: result.formattedDate || new Date(result.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            }))
            setHistory(formatted)
          }
        }
      } catch (error) {
        console.error('Error fetching quiz history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [testType])

  const latestResult = history.length > 0 ? history[0] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-lavender-bg flex flex-col h-full"
    >
      {/* Header with gradient */}
      <div className={`relative h-48 bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/20 via-transparent to-transparent" />
        <div className="relative z-10 text-white">
          <Icon className="w-16 h-16" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex-1 flex flex-col">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-lavender-bg text-primary-purple text-xs font-semibold rounded-full mb-3">
            {category}
          </span>
          <h3 className="text-h4 font-bold text-deep-navy mb-3">
            {title}
          </h3>
          <p className="text-body text-deep-navy/70 mb-4 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-body-small text-deep-navy/60 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>{questionsCount} вопросов</span>
          </div>
        </div>

        {/* История прохождения (если есть) */}
        {!loading && isAuthenticated && latestResult && (
          <div className="mb-3 mt-auto p-5 bg-gradient-to-br from-lavender-bg to-soft-white rounded-2xl border border-primary-purple/10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-primary-purple flex-shrink-0" />
              <span className="text-body-small font-medium text-deep-navy/80">Последний результат:</span>
            </div>
            <div className="flex flex-col items-center gap-2 mb-4">
              <span className="text-body-small text-deep-navy text-center">{latestResult.formattedDate}</span>
              <span className="text-body font-semibold text-primary-purple text-center">
                {latestResult.totalScore} {id === 'mrs' ? 'из 44' : 'баллов'}
              </span>
            </div>
            <div className="flex justify-center">
              <Link
                href={`/community/quiz-results?testType=${testType}&resultId=${latestResult.id}`}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary-purple/10 text-primary-purple rounded-full text-xs font-medium hover:bg-primary-purple/20 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Посмотреть</span>
              </Link>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className={latestResult ? "mt-2" : "mt-auto"}>
          {latestResult ? (
            <Link href={href} className="block">
              <Button variant="primary" className="w-full group flex items-center justify-center">
                <RefreshCcw className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Пройти повторно</span>
                <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <Link href={href} className="block">
              <Button variant="primary" className="w-full group flex items-center justify-center">
                <span>Пройти квиз</span>
                <ArrowRight className="w-4 h-4 ml-2 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

