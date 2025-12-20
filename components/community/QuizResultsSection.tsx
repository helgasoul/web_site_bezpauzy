'use client'

import { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Calendar, Download, ExternalLink, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { QuizComparison } from './QuizComparison'
import { QuizStatistics } from './QuizStatistics'

interface QuizResult {
  id: string
  total_score: number
  vasomotor_score: number
  psychological_score: number
  urogenital_score: number
  somatic_score: number
  severity: 'mild' | 'moderate' | 'severe'
  recommendations: string[]
  created_at: string
}

export const QuizResultsSection: FC = () => {
  const [results, setResults] = useState<QuizResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Get email from localStorage or session
        // In production, this should come from auth context
        const email = localStorage.getItem('user_email')
        
        if (!email) {
          console.log('No email found in localStorage')
          setIsLoading(false)
          return
        }

        console.log('Fetching results for email:', email)
        const response = await fetch(`/api/quiz/get-results?email=${encodeURIComponent(email)}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('API error:', response.status, errorData)
          throw new Error(errorData.error || 'Не удалось загрузить результаты')
        }

        const data = await response.json()
        console.log('Results fetched:', data.results?.length || 0, 'results')
        
        // Ensure results is an array and sort by created_at descending
        const sortedResults = (data.results || []).sort((a: QuizResult, b: QuizResult) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        
        setResults(sortedResults)
      } catch (err) {
        console.error('Error fetching results:', err)
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке результатов')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [])

  const severityLabels = {
    mild: { label: 'Лёгкая', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    moderate: { label: 'Умеренная', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    severe: { label: 'Выраженная', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-purple"></div>
        <p className="text-body text-deep-navy/70 mt-4">Загрузка результатов...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-body text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary-purple text-white rounded-full font-semibold hover:bg-primary-purple/90 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-deep-navy/30 mx-auto mb-4" />
        <h3 className="text-h3 font-bold text-deep-navy mb-2">
          Пока нет сохраненных результатов
        </h3>
        <p className="text-body text-deep-navy/70 mb-6">
          Пройдите квиз, чтобы сохранить результаты в личном кабинете
        </p>
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-lg transition-all"
        >
          Пройти квиз
          <ExternalLink className="w-5 h-5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-h2 font-bold text-deep-navy mb-4">
          Мои результаты квиза
        </h2>
        <p className="text-body text-deep-navy/70">
          Здесь хранятся все ваши сохраненные результаты оценки симптомов менопаузы
        </p>
      </div>

      {/* Statistics Section */}
      {results.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-primary-purple" />
            <h3 className="text-h3 font-bold text-deep-navy">Статистика и аналитика</h3>
          </div>
          <QuizStatistics results={results} />
        </div>
      )}

      {/* Comparison Section */}
      {results.length >= 2 && (
        <div className="mb-8">
          <QuizComparison results={results} />
        </div>
      )}

      {/* Individual Results */}
      <div>
        <h3 className="text-h3 font-bold text-deep-navy mb-6">История результатов</h3>
        <div className="space-y-6">
        {results.map((result) => {
          const severityInfo = severityLabels[result.severity]
          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-card p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-deep-navy/60" />
                    <span className="text-body-small text-deep-navy/60">
                      {formatDate(result.created_at)}
                    </span>
                  </div>
                  <h3 className="text-h4 font-semibold text-deep-navy mb-2">
                    Menopause Rating Scale (MRS)
                  </h3>
                </div>
                <div className={`${severityInfo.bgColor} ${severityInfo.borderColor} border-2 rounded-xl px-4 py-2 text-center`}>
                  <p className="text-xs font-semibold text-deep-navy/70 mb-1">Общий балл</p>
                  <p className="text-2xl font-bold text-deep-navy">{result.total_score}</p>
                  <p className={`text-sm font-semibold ${severityInfo.color} mt-1`}>
                    {severityInfo.label}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="text-xs font-semibold text-deep-navy/70 mb-1">Вазомоторные</p>
                  <p className="text-xl font-bold text-deep-navy">{result.vasomotor_score}</p>
                </div>
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="text-xs font-semibold text-deep-navy/70 mb-1">Психоэмоциональные</p>
                  <p className="text-xl font-bold text-deep-navy">{result.psychological_score}</p>
                </div>
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="text-xs font-semibold text-deep-navy/70 mb-1">Урогенитальные</p>
                  <p className="text-xl font-bold text-deep-navy">{result.urogenital_score}</p>
                </div>
                <div className="bg-lavender-bg rounded-xl p-4">
                  <p className="text-xs font-semibold text-deep-navy/70 mb-1">Соматические</p>
                  <p className="text-xl font-bold text-deep-navy">{result.somatic_score}</p>
                </div>
              </div>

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-primary-purple/5 to-ocean-wave-start/5 rounded-xl p-4 mb-4 border border-primary-purple/20">
                  <p className="text-sm font-semibold text-deep-navy mb-2">Рекомендации:</p>
                  <ul className="space-y-1">
                    {result.recommendations.slice(0, 2).map((rec, idx) => (
                      <li key={idx} className="text-body-small text-deep-navy/80 flex items-start gap-2">
                        <span className="text-primary-purple mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <Link
                  href="/quiz"
                  className="flex-1 px-4 py-2 bg-white border-2 border-primary-purple text-primary-purple rounded-xl font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300 text-center"
                >
                  Пройти снова
                </Link>
                <button
                  onClick={() => {
                    // Generate and download PDF for this result
                    // This would need the full result data
                    alert('Функция скачивания PDF для конкретного результата будет добавлена')
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Скачать PDF
                </button>
              </div>
            </motion.div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

