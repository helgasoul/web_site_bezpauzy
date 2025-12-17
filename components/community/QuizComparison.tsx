'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'

interface QuizResult {
  id: string
  total_score: number
  vasomotor_score: number
  psychological_score: number
  urogenital_score: number
  somatic_score: number
  severity: 'mild' | 'moderate' | 'severe'
  created_at: string
}

interface QuizComparisonProps {
  results: QuizResult[]
}

export const QuizComparison: FC<QuizComparisonProps> = ({ results }) => {
  if (results.length < 2) {
    return null
  }

  // Берем последние 2 результата для сравнения
  const latest = results[0]
  const previous = results[1]

  const calculateChange = (current: number, previous: number) => {
    const diff = current - previous
    const percent = previous !== 0 ? Math.round((diff / previous) * 100) : 0
    return { diff, percent }
  }

  const totalChange = calculateChange(latest.total_score, previous.total_score)
  const vasomotorChange = calculateChange(latest.vasomotor_score, previous.vasomotor_score)
  const psychologicalChange = calculateChange(latest.psychological_score, previous.psychological_score)
  const urogenitalChange = calculateChange(latest.urogenital_score, previous.urogenital_score)
  const somaticChange = calculateChange(latest.somatic_score, previous.somatic_score)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
  }

  const getChangeIcon = (diff: number) => {
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-green-600" />
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-deep-navy/40" />
  }

  const getChangeColor = (diff: number) => {
    if (diff < 0) return 'text-green-600' // Улучшение (меньше баллов = лучше)
    if (diff > 0) return 'text-red-600' // Ухудшение
    return 'text-deep-navy/60'
  }

  const categories = [
    {
      name: 'Общий балл',
      current: latest.total_score,
      previous: previous.total_score,
      change: totalChange,
      max: 44,
    },
    {
      name: 'Вазомоторные',
      current: latest.vasomotor_score,
      previous: previous.vasomotor_score,
      change: vasomotorChange,
      max: 8,
    },
    {
      name: 'Психоэмоциональные',
      current: latest.psychological_score,
      previous: previous.psychological_score,
      change: psychologicalChange,
      max: 20,
    },
    {
      name: 'Урогенитальные',
      current: latest.urogenital_score,
      previous: previous.urogenital_score,
      change: urogenitalChange,
      max: 8,
    },
    {
      name: 'Соматические',
      current: latest.somatic_score,
      previous: previous.somatic_score,
      change: somaticChange,
      max: 8,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary-purple/5 to-ocean-wave-start/5 rounded-2xl p-6 md:p-8 border border-primary-purple/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-h3 font-bold text-deep-navy mb-2">
            Сравнение результатов
          </h3>
          <p className="text-body-small text-deep-navy/70">
            Динамика изменений между последними прохождениями
          </p>
        </div>
        <div className="flex items-center gap-2 text-body-small text-deep-navy/60">
          <span>{formatDate(previous.created_at)}</span>
          <ArrowRight className="w-4 h-4" />
          <span className="font-semibold text-deep-navy">{formatDate(latest.created_at)}</span>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const isImprovement = category.change.diff < 0
          const isWorsening = category.change.diff > 0

          return (
            <div
              key={category.name}
              className="bg-white rounded-xl p-4 border border-lavender-bg"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-deep-navy">{category.name}</span>
                <div className="flex items-center gap-2">
                  {getChangeIcon(category.change.diff)}
                  <span className={`text-sm font-bold ${getChangeColor(category.change.diff)}`}>
                    {category.change.diff > 0 ? '+' : ''}
                    {category.change.diff} ({category.change.percent > 0 ? '+' : ''}
                    {category.change.percent}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Previous value */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-deep-navy/60">Предыдущий результат</span>
                    <span className="text-sm font-semibold text-deep-navy/70">
                      {category.previous}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-lavender-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-deep-navy/30 rounded-full"
                      style={{ width: `${(category.previous / category.max) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 text-deep-navy/40 flex-shrink-0" />

                {/* Current value */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-deep-navy/60">Текущий результат</span>
                    <span className="text-sm font-bold text-deep-navy">{category.current}</span>
                  </div>
                  <div className="w-full h-2 bg-lavender-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isImprovement
                          ? 'bg-gradient-to-r from-green-500 to-green-400'
                          : isWorsening
                          ? 'bg-gradient-to-r from-red-500 to-red-400'
                          : 'bg-gradient-to-r from-primary-purple to-ocean-wave-start'
                      }`}
                      style={{ width: `${(category.current / category.max) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Improvement/Worsening message */}
              {isImprovement && (
                <p className="text-xs text-green-600 mt-2 font-medium">
                  ✓ Улучшение: симптомы уменьшились
                </p>
              )}
              {isWorsening && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  ⚠ Ухудшение: симптомы усилились. Рекомендуем обратиться к врачу.
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-white/50 rounded-xl border border-primary-purple/10">
        <p className="text-xs text-deep-navy/70 leading-relaxed">
          <strong>Важно:</strong> Снижение баллов означает улучшение симптомов. Если вы видите
          ухудшение, это может быть связано с естественными колебаниями или изменениями в образе
          жизни. Обсудите результаты с вашим врачом.
        </p>
      </div>
    </motion.div>
  )
}

