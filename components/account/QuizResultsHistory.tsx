'use client'

import { FC, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Activity, Flame, Calendar, TrendingUp, TrendingDown, Minus, Trash2, Download, RefreshCcw, Scale, ArrowLeft } from 'lucide-react'
import { getUserEmail } from '@/lib/quiz/save-results'
import { getMRSSeverityLabel, getMRSSeverityEmoji, getMRSSeverityColor } from '@/lib/mrs-quiz/scoring'
import { getInflammationLevelLabel, getInflammationLevelEmoji, getInflammationLevelColor } from '@/lib/inflammation-quiz/scoring'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface MRSResult {
  id: string
  total_score: number
  severity: 'mild' | 'moderate' | 'severe'
  vasomotor_score?: number // Из API может приходить vasomotor_score
  somatic_score: number
  psychological_score: number
  urogenital_score: number
  recommendations?: string[]
  answers?: {
    explanations?: {
      severityLabel?: string
      severityDescription?: string
      categoryBreakdown?: {
        somatic?: { score: number; description: string }
        psychological?: { score: number; description: string }
        urogenital?: { score: number; description: string }
      }
    }
  }
  created_at: string
}

interface InflammationResult {
  id: string
  test_type: string
  total_score: number
  inflammation_level: string
  diet_score: number
  lifestyle_score: number
  bmi_score: number
  waist_score: number
  bmi: number | null
  demographics?: any
  high_risk_categories?: string[]
  recommendations?: string[]
  answers?: {
    explanations?: {
      levelLabel?: string
      levelDescription?: string
      scoreBreakdown?: {
        diet?: { score: number; description: string }
        lifestyle?: { score: number; description: string }
        bmi?: { score: number; value: number; description: string }
        waist?: { score: number; description: string }
      }
      highRiskCategories?: string[]
    }
  }
  explanations?: {
    levelLabel?: string
    levelDescription?: string
    scoreBreakdown?: any
  }
  created_at: string
}

export const QuizResultsHistory: FC = () => {
  const router = useRouter()
  const [mrsResults, setMrsResults] = useState<MRSResult[]>([])
  const [inflammationResults, setInflammationResults] = useState<InflammationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const loadResults = useCallback(async () => {
    try {
      // Сначала проверяем сессию
      const sessionResponse = await fetch('/api/auth/telegram/get-session')
      const sessionData = await sessionResponse.json()

      if (!sessionData.authenticated) {
        // Если нет сессии, пытаемся получить email из localStorage (для обратной совместимости)
        const email = getUserEmail()
        if (!email) {
          setIsAuthenticated(false)
          setLoading(false)
          return
        }
        setIsAuthenticated(true)
        // Загружаем результаты по email
        try {
          const response = await fetch(`/api/quiz/get-results?email=${encodeURIComponent(email)}`)
          if (response.ok) {
            const data = await response.json()
            processResults(data.results || [])
          }
        } catch (error) {
          console.error('Error loading results:', error)
        }
        setLoading(false)
        return
      }

      setIsAuthenticated(true)

      // Load results using API with session (user_id будет взят из сессии)
      try {
        const response = await fetch('/api/quiz/get-results')
        if (response.ok) {
          const data = await response.json()
          processResults(data.results || [])
        }
      } catch (error) {
        console.error('Error loading results:', error)
      }
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadResults()
  }, [loadResults])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const processResults = (results: any[]) => {
    // Разделяем результаты по типам
    const mrsResults: MRSResult[] = []
    const inflammationResults: InflammationResult[] = []
    
    results.forEach((r: any) => {
      const testType = r.test_type?.toLowerCase() || ''
      
      if (testType === 'inflammation') {
        inflammationResults.push({
          id: r.id,
          test_type: r.test_type,
          total_score: r.total_score || 0,
          inflammation_level: r.inflammation_level || r.severity || 'moderate',
          diet_score: r.diet_score || 0,
          lifestyle_score: r.lifestyle_score || 0,
          bmi_score: r.bmi_score || 0,
          waist_score: r.waist_score || 0,
          bmi: r.bmi,
          demographics: r.demographics,
          high_risk_categories: r.high_risk_categories || [],
          recommendations: r.recommendations || [],
          created_at: r.created_at
        })
      } else if (testType === 'mrs' || (!testType && r.somatic_score !== undefined && r.psychological_score !== undefined && r.urogenital_score !== undefined && testType !== 'frax' && testType !== 'phenoage' && testType !== 'whr')) {
        // MRS квиз определяется ТОЛЬКО если:
        // 1. Явно указан test_type === 'mrs'
        // 2. ИЛИ если test_type не указан, но есть ВСЕ специфичные поля MRS И это не другой тип квиза
        // Это предотвращает попадание результатов других квизов (FRAX, PhenoAge, WHR) в секцию MRS
        mrsResults.push({
          id: r.id,
          total_score: r.total_score || 0,
          severity: (r.severity || 'mild') as 'mild' | 'moderate' | 'severe',
          vasomotor_score: r.vasomotor_score,
          somatic_score: r.somatic_score || 0,
          psychological_score: r.psychological_score || 0,
          urogenital_score: r.urogenital_score || 0,
          recommendations: r.recommendations || [],
          created_at: r.created_at
        })
      }
      // Игнорируем другие типы квизов (frax, phenoage, whr) - они должны отображаться в отдельных секциях
      // TODO: Добавить отдельные секции для FRAX, PhenoAge, WHR квизов
    })
    
    setMrsResults(mrsResults)
    setInflammationResults(inflammationResults)
  }

  const getTrendIcon = (current: number, previous: number | undefined) => {
    if (!previous) return <Minus className="w-4 h-4 text-deep-navy/40" />
    if (current < previous) return <TrendingDown className="w-4 h-4 text-success" />
    if (current > previous) return <TrendingUp className="w-4 h-4 text-error" />
    return <Minus className="w-4 h-4 text-deep-navy/40" />
  }

  const handleDeleteResult = async (resultId: string, testType: 'mrs' | 'inflammation') => {
    if (!confirm('Вы уверены, что хотите удалить этот результат? Это действие нельзя отменить.')) {
      return
    }

    setDeletingIds(prev => new Set(prev).add(resultId))

    try {
      const response = await fetch('/api/quiz/delete-result', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resultId }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Не удалось удалить результат')
        return
      }

      // Удаляем результат из состояния
      if (testType === 'mrs') {
        setMrsResults(prev => prev.filter(r => r.id !== resultId))
      } else {
        setInflammationResults(prev => prev.filter(r => r.id !== resultId))
      }
    } catch (error) {
      console.error('Error deleting result:', error)
      alert('Произошла ошибка при удалении результата')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(resultId)
        return newSet
      })
    }
  }

  const handleDownloadPDF = async (result: MRSResult | InflammationResult, testType: 'mrs' | 'inflammation') => {
    try {
      console.log('[QuizResultsHistory] Starting PDF download for:', testType, result)
      
      // Подготавливаем данные для генерации PDF
      let pdfData: any
      let endpoint: string

      if (testType === 'mrs') {
        const mrsResult = result as MRSResult
        pdfData = {
          total_score: mrsResult.total_score ?? 0,
          severity: mrsResult.severity || 'mild',
          vasomotor_score: mrsResult.vasomotor_score ?? 0,
          psychological_score: mrsResult.psychological_score ?? 0,
          urogenital_score: mrsResult.urogenital_score ?? 0,
          somatic_score: mrsResult.somatic_score ?? 0,
          recommendations: mrsResult.recommendations || [],
        }
        endpoint = '/api/quiz/mrs/pdf'
        console.log('[QuizResultsHistory] MRS PDF data:', pdfData)
      } else {
        const inflammationResult = result as InflammationResult
        pdfData = {
          total_inflammation_score: inflammationResult.total_score ?? 0,
          inflammation_level: inflammationResult.inflammation_level || 'moderate',
          diet_score: inflammationResult.diet_score ?? 0,
          lifestyle_score: inflammationResult.lifestyle_score ?? 0,
          bmi_score: inflammationResult.bmi_score ?? 0,
          waist_score: inflammationResult.waist_score ?? 0,
          bmi: inflammationResult.bmi ?? 0,
          high_risk_categories: inflammationResult.high_risk_categories || [],
          demographics: inflammationResult.demographics || {
            age_range: '',
            height_cm: 0,
            weight_kg: 0,
          },
          recommendations: inflammationResult.recommendations || [],
        }
        endpoint = '/api/quiz/inflammation/pdf'
        console.log('[QuizResultsHistory] Inflammation PDF data:', pdfData)
      }

      console.log('[QuizResultsHistory] Sending request to:', endpoint)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      })

      console.log('[QuizResultsHistory] Response status:', response.status, response.statusText)

      if (!response.ok) {
        // Пытаемся получить детали ошибки
        let errorMessage = 'Не удалось сгенерировать PDF'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
          console.error('[QuizResultsHistory] API error details:', errorData)
        } catch (e) {
          console.error('[QuizResultsHistory] Could not parse error response:', e)
        }
        throw new Error(errorMessage)
      }

      const blob = await response.blob()
      console.log('[QuizResultsHistory] PDF blob received, size:', blob.size, 'bytes')

      if (blob.size === 0) {
        throw new Error('Получен пустой PDF файл')
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      if (testType === 'mrs') {
        const mrsResult = result as MRSResult
        a.download = `mrs-quiz-results-${new Date(mrsResult.created_at).toISOString().split('T')[0]}.pdf`
      } else {
        const inflammationResult = result as InflammationResult
        a.download = `inflammation-quiz-results-${new Date(inflammationResult.created_at).toISOString().split('T')[0]}.pdf`
      }
      
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      console.log('[QuizResultsHistory] PDF downloaded successfully')
    } catch (error) {
      console.error('[QuizResultsHistory] Error downloading PDF:', error)
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка'
      alert(`Не удалось скачать PDF: ${errorMessage}. Попробуйте позже или обратитесь в поддержку.`)
    }
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-body text-deep-navy/60">Загрузка...</div>
          </div>
        </div>
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-soft-white to-lavender-bg rounded-3xl p-8 md:p-10 border-2 border-primary-purple/20 shadow-lg text-center">
              <h1 className="text-h2 font-bold text-deep-navy mb-4">
                Войдите в аккаунт
              </h1>
              <p className="text-body text-deep-navy/70 mb-6">
                Чтобы просматривать сохраненные результаты квизов, необходимо войти в аккаунт.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-primary text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Войти в аккаунт
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-body text-deep-navy/70 hover:text-primary-purple transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>
          <h1 className="text-h1 font-bold text-deep-navy mb-2">
            Мои результаты квизов
          </h1>
          <p className="text-body text-deep-navy/70 mb-8">
            История ваших результатов. Отслеживайте изменения со временем.
          </p>

          {/* MRS Results */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-primary-purple" />
              <h2 className="text-h3 font-bold text-deep-navy">Menopause Rating Scale (MRS)</h2>
            </div>

            {mrsResults.length === 0 ? (
              <div className="bg-gradient-to-br from-lavender-bg to-soft-white rounded-2xl p-8 border-2 border-primary-purple/20 text-center">
                <p className="text-body text-deep-navy/70 mb-4">
                  У вас пока нет сохраненных результатов MRS квиза
                </p>
                <Link
                  href="/quiz/mrs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Пройти квиз MRS
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {mrsResults.map((result, index) => {
                  const previousResult = mrsResults[index + 1]
                  const severityColor = getMRSSeverityColor(result.severity as any)
                  const severityEmoji = getMRSSeverityEmoji(result.severity as any)
                  const severityLabel = getMRSSeverityLabel(result.severity as any)

                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-gradient-to-br ${severityColor} rounded-2xl p-6 border-2 border-primary-purple/20 shadow-md`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{severityEmoji}</span>
                          <div>
                            <h3 className="text-h5 font-semibold text-deep-navy">
                              {severityLabel}
                            </h3>
                            <div className="flex items-center gap-2 text-body-small text-deep-navy/60">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(result.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-h4 font-bold text-deep-navy">
                            {result.total_score}
                          </div>
                          <div className="text-body-small text-deep-navy/60">из 44</div>
                          {previousResult && getTrendIcon(result.total_score, previousResult.total_score)}
                        </div>
                      </div>
                      {/* Описание уровня тяжести (если сохранено) */}
                      {result.answers?.explanations?.severityDescription && (
                        <div className="mb-4 p-4 bg-white/50 rounded-xl">
                          <p className="text-body text-deep-navy/80 leading-relaxed">
                            {result.answers.explanations.severityDescription}
                          </p>
                        </div>
                      )}
                      
                      <div className={`grid gap-4 text-center ${result.vasomotor_score !== undefined ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'} mb-4`}>
                        {result.vasomotor_score !== undefined && (
                          <div>
                            <div className="text-body-small text-deep-navy/60 mb-1">Вазомоторные</div>
                            <div className="text-body font-semibold text-deep-navy">{result.vasomotor_score}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-body-small text-deep-navy/60 mb-1">Соматические</div>
                          <div className="text-body font-semibold text-deep-navy">{result.somatic_score}</div>
                        </div>
                        <div>
                          <div className="text-body-small text-deep-navy/60 mb-1">Психологические</div>
                          <div className="text-body font-semibold text-deep-navy">{result.psychological_score}</div>
                        </div>
                        <div>
                          <div className="text-body-small text-deep-navy/60 mb-1">Урогенитальные</div>
                          <div className="text-body font-semibold text-deep-navy">{result.urogenital_score}</div>
                        </div>
                      </div>
                      
                      {/* Рекомендации (если сохранены) */}
                      {result.recommendations && result.recommendations.length > 0 && (
                        <div className="mb-4 p-4 bg-gradient-to-br from-primary-purple/5 to-ocean-wave-start/5 rounded-xl border border-primary-purple/20">
                          <h4 className="text-body font-semibold text-deep-navy mb-2">Рекомендации:</h4>
                          <ul className="space-y-2">
                            {result.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-body-small text-deep-navy/80">
                                <span className="text-primary-purple mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Кнопки действий */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-deep-navy/10">
                        <Link
                          href="/quiz/mrs"
                          className="flex items-center gap-2 px-4 py-2 bg-primary-purple/10 text-primary-purple border-2 border-primary-purple/20 rounded-full text-sm font-medium hover:bg-primary-purple/20 hover:border-primary-purple/40 transition-colors"
                        >
                          <RefreshCcw className="w-4 h-4" />
                          Пройти повторно
                        </Link>
                        {previousResult && (
                          <Link
                            href={`/community/quiz-results?testType=mrs&compare=${result.id},${previousResult.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-ocean-wave-start/10 text-ocean-wave-start border-2 border-ocean-wave-start/20 rounded-full text-sm font-medium hover:bg-ocean-wave-start/20 hover:border-ocean-wave-start/40 transition-colors"
                          >
                            <Scale className="w-4 h-4" />
                            Сравнить результаты
                          </Link>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(result, 'mrs')}
                          disabled={deletingIds.has(result.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-soft-white rounded-full text-sm font-medium hover:bg-primary-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4" />
                          Скачать PDF
                        </button>
                        <button
                          onClick={() => handleDeleteResult(result.id, 'mrs')}
                          disabled={deletingIds.has(result.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-transparent text-error border-2 border-error rounded-full text-sm font-medium hover:bg-error/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingIds.has(result.id) ? (
                            <>
                              <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin"></div>
                              Удаление...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Удалить результаты
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Inflammation Results */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Flame className="w-6 h-6 text-warm-accent" />
              <h2 className="text-h3 font-bold text-deep-navy">Индекс воспаления</h2>
            </div>

            {inflammationResults.length === 0 ? (
              <div className="bg-gradient-to-br from-lavender-bg to-soft-white rounded-2xl p-8 border-2 border-primary-purple/20 text-center">
                <p className="text-body text-deep-navy/70 mb-4">
                  У вас пока нет сохраненных результатов квиза &quot;Индекс воспаления&quot;
                </p>
                <Link
                  href="/quiz/inflammation"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  Пройти квиз
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {inflammationResults.map((result, index) => {
                  const previousResult = inflammationResults[index + 1]
                  const levelColor = getInflammationLevelColor(result.inflammation_level as any)
                  const levelEmoji = getInflammationLevelEmoji(result.inflammation_level as any)
                  const levelLabel = getInflammationLevelLabel(result.inflammation_level as any)

                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (mrsResults.length + index) * 0.1 }}
                      className={`bg-gradient-to-br ${levelColor} rounded-2xl p-6 border-2 border-primary-purple/20 shadow-md`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{levelEmoji}</span>
                          <div>
                            <h3 className="text-h5 font-semibold text-deep-navy">
                              {levelLabel}
                            </h3>
                            <div className="flex items-center gap-2 text-body-small text-deep-navy/60">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(result.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-h4 font-bold text-deep-navy">
                            {result.total_score > 0 ? '+' : ''}{result.total_score}
                          </div>
                          <div className="text-body-small text-deep-navy/60">баллов</div>
                          {previousResult && getTrendIcon(result.total_score, previousResult.total_score)}
                        </div>
                      </div>
                      {/* Описание уровня воспаления (если сохранено) */}
                      {(result.explanations?.levelDescription || result.answers?.explanations?.levelDescription) && (
                        <div className="mb-4 p-4 bg-white/50 rounded-xl">
                          <p className="text-body text-deep-navy/80 leading-relaxed">
                            {result.explanations?.levelDescription || result.answers?.explanations?.levelDescription}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-4 text-center mb-4">
                        <div>
                          <div className="text-body-small text-deep-navy/60 mb-1">Питание</div>
                          <div className="text-body font-semibold text-deep-navy">
                            {result.diet_score > 0 ? '+' : ''}{result.diet_score}
                          </div>
                        </div>
                        <div>
                          <div className="text-body-small text-deep-navy/60 mb-1">Образ жизни</div>
                          <div className="text-body font-semibold text-deep-navy">
                            {result.lifestyle_score > 0 ? '+' : ''}{result.lifestyle_score}
                          </div>
                        </div>
                        <div>
                          <div className="text-body-small text-deep-navy/60 mb-1">ИМТ</div>
                          <div className="text-body font-semibold text-deep-navy">
                            {result.bmi ? result.bmi.toFixed(1) : '—'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Рекомендации (если сохранены) */}
                      {result.recommendations && result.recommendations.length > 0 && (
                        <div className="mb-4 p-4 bg-gradient-to-br from-primary-purple/5 to-ocean-wave-start/5 rounded-xl border border-primary-purple/20">
                          <h4 className="text-body font-semibold text-deep-navy mb-2">Рекомендации:</h4>
                          <ul className="space-y-2">
                            {result.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-body-small text-deep-navy/80">
                                <span className="text-primary-purple mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Кнопки действий */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-deep-navy/10">
                        <Link
                          href="/quiz/inflammation"
                          className="flex items-center gap-2 px-4 py-2 bg-primary-purple/10 text-primary-purple border-2 border-primary-purple/20 rounded-full text-sm font-medium hover:bg-primary-purple/20 hover:border-primary-purple/40 transition-colors"
                        >
                          <RefreshCcw className="w-4 h-4" />
                          Пройти повторно
                        </Link>
                        {previousResult && (
                          <Link
                            href={`/community/quiz-results?testType=inflammation&compare=${result.id},${previousResult.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-ocean-wave-start/10 text-ocean-wave-start border-2 border-ocean-wave-start/20 rounded-full text-sm font-medium hover:bg-ocean-wave-start/20 hover:border-ocean-wave-start/40 transition-colors"
                          >
                            <Scale className="w-4 h-4" />
                            Сравнить результаты
                          </Link>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(result, 'inflammation')}
                          disabled={deletingIds.has(result.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-purple text-soft-white rounded-full text-sm font-medium hover:bg-primary-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4" />
                          Скачать PDF
                        </button>
                        <button
                          onClick={() => handleDeleteResult(result.id, 'inflammation')}
                          disabled={deletingIds.has(result.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-transparent text-error border-2 border-error rounded-full text-sm font-medium hover:bg-error/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingIds.has(result.id) ? (
                            <>
                              <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin"></div>
                              Удаление...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Удалить результаты
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

