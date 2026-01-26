'use client'

import { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Eye, RotateCcw, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface QuizHistoryResult {
  id: string
  testType: 'mrs' | 'inflammation'
  totalScore: number
  severity: string
  createdAt: string
  updatedAt: string
  formattedDate: string
}

interface QuizHistoryProps {
  testType: 'mrs' | 'inflammation'
  onStartNew?: () => void
}

export const QuizHistory: FC<QuizHistoryProps> = ({ testType, onStartNew }) => {
  const [history, setHistory] = useState<QuizHistoryResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/quiz/history?testType=${testType}`)
        const data = await response.json()
        if (data.results) {
          setHistory(data.results)
        }
      } catch (error) {
        console.error('Error fetching quiz history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [testType])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
      </div>
    )
  }

  if (history.length === 0) {
    return null // Не показываем ничего, если нет истории
  }

  const latestResult = history[0] // Самый последний результат

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-lavender-bg mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-lavender-bg rounded-full">
          <Calendar className="w-5 h-5 text-primary-purple" />
        </div>
        <h2 className="text-h4 font-semibold text-deep-navy">
          Ваши предыдущие результаты
        </h2>
      </div>

      <div className="space-y-4">
        {/* Последний результат */}
        <div className="bg-gradient-to-r from-lavender-bg to-soft-white rounded-2xl p-6 border border-primary-purple/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-body-small text-deep-navy/70 mb-1">
                Последний результат
              </p>
              <p className="text-body font-semibold text-deep-navy">
                {latestResult.formattedDate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-h5 font-bold text-primary-purple">
                {latestResult.totalScore}
              </p>
              <p className="text-body-small text-deep-navy/70 capitalize">
                {latestResult.severity}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/community/quiz-results?testType=${testType}&resultId=${latestResult.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-soft-white rounded-full text-sm font-medium hover:bg-primary-purple/90 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Посмотреть результаты
            </Link>

            {onStartNew && (
              <button
                onClick={onStartNew}
                className="flex items-center gap-2 px-4 py-2 bg-transparent text-primary-purple border-2 border-primary-purple rounded-full text-sm font-medium hover:bg-primary-purple/5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Пройти квиз повторно
              </button>
            )}

            {history.length > 1 && (
              <Link
                href={`/community/quiz-results?testType=${testType}&compare=true`}
                className="flex items-center gap-2 px-4 py-2 bg-transparent text-primary-purple border-2 border-primary-purple rounded-full text-sm font-medium hover:bg-primary-purple/5 transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                Сравнить результаты
              </Link>
            )}
          </div>
        </div>

        {/* Предыдущие результаты (если есть) */}
        {history.length > 1 && (
          <div>
            <p className="text-body-small text-deep-navy/70 mb-3">
              Предыдущие прохождения ({history.length - 1}):
            </p>
            <div className="space-y-2">
              {history.slice(1, 4).map((result) => (
                <Link
                  key={result.id}
                  href={`/community/quiz-results?testType=${testType}&resultId=${result.id}`}
                  className="flex items-center justify-between p-3 bg-lavender-bg/50 rounded-xl hover:bg-lavender-bg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-deep-navy/50" />
                    <span className="text-body-small text-deep-navy">
                      {result.formattedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-body-small font-medium text-deep-navy">
                      {result.totalScore} баллов
                    </span>
                    <ArrowRight className="w-4 h-4 text-deep-navy/50 group-hover:text-primary-purple transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

