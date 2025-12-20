'use client'

import { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Flame, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { getUserEmail } from '@/lib/quiz/save-results'
import { getMRSSeverityLabel, getMRSSeverityEmoji, getMRSSeverityColor } from '@/lib/mrs-quiz/scoring'
import { getInflammationLevelLabel, getInflammationLevelEmoji, getInflammationLevelColor } from '@/lib/inflammation-quiz/scoring'
import Link from 'next/link'

interface MRSResult {
  id: string
  total_score: number
  severity: 'mild' | 'moderate' | 'severe'
  vasomotor_score?: number // Из API может приходить vasomotor_score
  somatic_score: number
  psychological_score: number
  urogenital_score: number
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
  created_at: string
}

export const QuizResultsHistory: FC = () => {
  const [mrsResults, setMrsResults] = useState<MRSResult[]>([])
  const [inflammationResults, setInflammationResults] = useState<InflammationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    loadResults()
  }, [])

  const loadResults = async () => {
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
  }

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
      if (r.test_type === 'inflammation') {
        inflammationResults.push({
          id: r.id,
          test_type: r.test_type,
          total_score: r.total_score || 0,
          inflammation_level: r.inflammation_level || r.severity || 'moderate',
          diet_score: r.diet_score || r.vasomotor_score || 0,
          lifestyle_score: r.lifestyle_score || r.psychological_score || 0,
          bmi_score: r.bmi_score || r.urogenital_score || 0,
          waist_score: r.waist_score || r.somatic_score || 0,
          bmi: r.bmi,
          demographics: r.demographics,
          high_risk_categories: r.high_risk_categories || [],
          created_at: r.created_at
        })
      } else {
        mrsResults.push({
          id: r.id,
          total_score: r.total_score || 0,
          severity: (r.severity || 'mild') as 'mild' | 'moderate' | 'severe',
          vasomotor_score: r.vasomotor_score,
          somatic_score: r.somatic_score || 0,
          psychological_score: r.psychological_score || 0,
          urogenital_score: r.urogenital_score || 0,
          created_at: r.created_at
        })
      }
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
                href="/login"
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
                      <div className={`grid gap-4 text-center ${result.vasomotor_score !== undefined ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'}`}>
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
                  У вас пока нет сохраненных результатов квиза "Индекс воспаления"
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
                      <div className="grid grid-cols-3 gap-4 text-center">
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

