'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, Download, Sparkles, CheckCircle2 } from 'lucide-react'
import { getMRSSeverityLabel, getMRSSeverityDescription, getMRSSeverityColor, getMRSSeverityEmoji } from '@/lib/mrs-quiz/scoring'
import type { MRSResult } from '@/lib/types/mrs-quiz'
import { TipsBox } from '@/components/blog/TipsBox'
import { StatHighlight } from '@/components/blog/StatHighlight'
import { SaveResultsButton } from './SaveResultsButton'
import { AskEvaQuizButton } from './AskEvaQuizButton'
import { DownloadQuizPDFButton } from './DownloadQuizPDFButton'
import type { MRSAnswer } from '@/lib/types/mrs-quiz'

interface MRSQuizResultsProps {
  result: MRSResult
  answers: MRSAnswer
}

export const MRSQuizResults: FC<MRSQuizResultsProps> = ({ result, answers }) => {
  const severityColor = getMRSSeverityColor(result.severity)
  const severityEmoji = getMRSSeverityEmoji(result.severity)
  const severityLabel = getMRSSeverityLabel(result.severity)
  const severityDescription = getMRSSeverityDescription(result.severity)

  const getRecommendations = () => {
    const recommendations: string[] = []
    
    if (result.severity === 'very_severe' || result.severity === 'severe') {
      recommendations.push('Рекомендуется консультация с гинекологом для обсуждения вариантов лечения, включая ЗГТ')
    }
    
    if (result.somatic_score >= 8) {
      recommendations.push('При сильных соматических симптомах (приливы, проблемы со сном) рассмотрите ЗГТ или альтернативные методы')
    }
    
    if (result.psychological_score >= 8) {
      recommendations.push('При выраженных психологических симптомах важны управление стрессом, достаточный сон и физическая активность')
    }
    
    if (result.urogenital_score >= 6) {
      recommendations.push('При урогенитальных симптомах эффективна местная (вагинальная) ЗГТ, которая обычно безопасна даже при противопоказаниях к системной ЗГТ')
    }

    if (result.severity === 'moderate') {
      recommendations.push('Немедикаментозные методы (питание, физическая активность, управление стрессом) могут помочь облегчить симптомы')
    }

    if (recommendations.length === 0) {
      recommendations.push('Продолжайте поддерживать здоровый образ жизни')
      recommendations.push('Регулярно отслеживайте изменения симптомов')
    }

    return recommendations.slice(0, 5)
  }

  return (
    <div className="space-y-8">
      {/* Main Result Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${severityColor} rounded-3xl p-8 md:p-10 border-2 border-primary-purple/20 shadow-lg relative overflow-hidden`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-purple/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-ocean-wave-start/5 rounded-full blur-2xl -ml-12 -mb-12" />

        <div className="relative z-10 text-center">
          <div className="text-6xl mb-4">{severityEmoji}</div>
          <h1 className="text-h1 font-bold text-deep-navy mb-4">
            {severityLabel}
          </h1>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full mb-6">
            <Activity className="w-5 h-5 text-primary-purple" />
            <span className="text-body font-semibold text-deep-navy">
              Общий балл: {result.total_score} из 44
            </span>
          </div>
          <p className="text-body-large text-deep-navy/80 leading-relaxed max-w-2xl mx-auto">
            {severityDescription}
          </p>
        </div>
      </motion.div>

      {/* Score Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StatHighlight
          source="Детализация по категориям"
          stats={[
            `Соматические симптомы: ${result.somatic_score} баллов (приливы, сердцебиение, сон, боли)`,
            `Психологические симптомы: ${result.psychological_score} баллов (настроение, раздражительность, тревога, усталость)`,
            `Урогенитальные симптомы: ${result.urogenital_score} баллов (половая жизнь, мочевой пузырь, сухость)`
          ]}
        />
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TipsBox tips={getRecommendations()} />
      </motion.div>

      {/* Save Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-lavender-bg to-soft-white rounded-3xl p-6 border-2 border-primary-purple/20 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary-purple" />
          <h3 className="text-h5 font-semibold text-deep-navy">Сохранить результаты</h3>
        </div>
        <p className="text-body-small text-deep-navy/70 mb-4">
          Сохраните результаты в личном кабинете, чтобы отслеживать изменения со временем
        </p>
        <SaveResultsButton
          quizType="mrs"
          mrsData={{ result, answers }}
        />
      </motion.div>

      {/* Ask Eva Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <AskEvaQuizButton
          quizType="mrs"
          quizResult={{
            level: result.severity,
            score: result.total_score
          }}
        />
      </motion.div>

      {/* Download Results PDF */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-primary-purple/10 via-ocean-wave-start/10 to-warm-accent/10 rounded-3xl p-8 border-2 border-primary-purple/20 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary-purple" />
          <h3 className="text-h4 font-bold text-deep-navy">Обсудите результаты с врачом</h3>
        </div>
        <p className="text-body text-deep-navy/70 mb-6">
          Результаты этого квиза помогут вам и вашему врачу оценить ситуацию и принять решение о необходимости лечения, включая ЗГТ.
        </p>
        <DownloadQuizPDFButton
          quizType="mrs"
          quizData={{
            total_score: result.total_score,
            severity: result.severity,
            vasomotor_score: result.vasomotor_score,
            psychological_score: result.psychological_score,
            urogenital_score: result.urogenital_score,
            somatic_score: result.somatic_score,
            recommendations: getRecommendations(),
          }}
        />
      </motion.div>
    </div>
  )
}

