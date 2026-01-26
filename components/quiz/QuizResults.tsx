'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Activity, TrendingDown, Download, Sparkles, CheckCircle2 } from 'lucide-react'
import { getInflammationLevelLabel, getInflammationLevelDescription, getInflammationLevelColor, getInflammationLevelEmoji } from '@/lib/inflammation-quiz/scoring'
import type { InflammationResult, Demographics } from '@/lib/types/inflammation-quiz'
import { TipsBox } from '@/components/blog/TipsBox'
import { StatHighlight } from '@/components/blog/StatHighlight'
import { SaveResultsButton } from './SaveResultsButton'
import { AskEvaQuizButton } from './AskEvaQuizButton'
import { DownloadQuizPDFButton } from './DownloadQuizPDFButton'
import { DownloadGuideButton } from './DownloadGuideButton'
import { DownloadLabChecklistButton } from './DownloadLabChecklistButton'
import { SaveToCollectionButton } from '@/components/ui/SaveToCollectionButton'
import type { InflammationAnswers } from '@/lib/types/inflammation-quiz'

interface QuizResultsProps {
  result: InflammationResult
  demographics: Demographics
  answers: InflammationAnswers
}

export const QuizResults: FC<QuizResultsProps> = ({ result, demographics, answers }) => {
  const levelColor = getInflammationLevelColor(result.inflammation_level)
  const levelEmoji = getInflammationLevelEmoji(result.inflammation_level)
  const levelLabel = getInflammationLevelLabel(result.inflammation_level)
  const levelDescription = getInflammationLevelDescription(result.inflammation_level)

  const getRecommendations = () => {
    const recommendations: string[] = []
    
    if (result.high_risk_categories.includes('processed_meat')) {
      recommendations.push('Сократите обработанное мясо (колбасы, сосиски) до 1 раза в неделю или реже')
    }
    if (result.high_risk_categories.includes('omega3_deficiency')) {
      recommendations.push('Добавьте жирную рыбу (лосось, скумбрия) 2-3 раза в неделю или рассмотрите добавки омега-3')
    }
    if (result.high_risk_categories.includes('sedentary')) {
      recommendations.push('Увеличьте физическую активность: начните с 30 минут ходьбы каждый день')
    }
    if (result.high_risk_categories.includes('poor_sleep')) {
      recommendations.push('Улучшите качество сна: установите режим, уберите экраны за 2 часа до сна')
    }
    if (result.high_risk_categories.includes('high_stress')) {
      recommendations.push('Добавьте практики управления стрессом: медитация, дыхательные упражнения, йога')
    }
    if (result.high_risk_categories.includes('refined_carbs')) {
      recommendations.push('Замените рафинированные углеводы на цельнозерновые: бурый рис, цельнозерновой хлеб')
    }

    if (recommendations.length === 0) {
      recommendations.push('Продолжайте поддерживать здоровые привычки!')
      recommendations.push('Добавьте больше разнообразия в растительные продукты')
      recommendations.push('Регулярно проверяйте свой индекс воспаления')
    }

    return recommendations.slice(0, 5)
  }

  return (
    <div className="space-y-8">
      {/* Main Result Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${levelColor} rounded-3xl p-8 md:p-10 border-2 border-primary-purple/20 shadow-lg relative overflow-hidden`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-purple/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-ocean-wave-start/5 rounded-full blur-2xl -ml-12 -mb-12" />

        <div className="relative z-10 text-center">
          <div className="text-6xl mb-4">{levelEmoji}</div>
          <h1 className="text-h1 font-bold text-deep-navy mb-4">
            {levelLabel}
          </h1>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full mb-6">
            <Activity className="w-5 h-5 text-primary-purple" />
            <span className="text-body font-semibold text-deep-navy">
              Индекс: {result.total_inflammation_score}
            </span>
          </div>
          <p className="text-body-large text-deep-navy/80 leading-relaxed max-w-2xl mx-auto">
            {levelDescription}
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
          source="Детализация баллов"
          stats={[
            `Питание: ${result.diet_score > 0 ? '+' : ''}${result.diet_score} баллов`,
            `Образ жизни: ${result.lifestyle_score > 0 ? '+' : ''}${result.lifestyle_score} баллов`,
            `ИМТ: ${result.bmi.toFixed(1)} (${result.bmi_score} баллов)`,
            result.waist_score > 0 ? `Окружность талии: ${result.waist_score} баллов` : 'Окружность талии: не указана'
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

      {/* Risk Categories */}
      {result.high_risk_categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-warm-accent/10 to-primary-purple/10 rounded-3xl p-8 border-2 border-warm-accent/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingDown className="w-6 h-6 text-warm-accent" />
            <h3 className="text-h4 font-bold text-deep-navy">Области для улучшения</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.high_risk_categories.map((category, index) => {
              const categoryLabels: Record<string, string> = {
                processed_meat: 'Обработанное мясо',
                refined_carbs: 'Рафинированные углеводы',
                omega3_deficiency: 'Недостаток омега-3',
                low_fiber: 'Низкое потребление клетчатки',
                excessive_alcohol: 'Избыток алкоголя',
                sedentary: 'Малоподвижный образ жизни',
                poor_sleep: 'Проблемы со сном',
                high_stress: 'Высокий уровень стресса',
                smoking: 'Курение',
                obesity: 'Ожирение',
                abdominal_obesity: 'Абдоминальное ожирение'
              }
              return (
                <div key={index} className="flex items-center gap-2 p-3 bg-white/60 rounded-xl">
                  <div className="w-2 h-2 bg-warm-accent rounded-full" />
                  <span className="text-body text-deep-navy/80">{categoryLabels[category] || category}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

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
          quizType="inflammation"
          inflammationData={{ result, demographics, answers }}
        />
      </motion.div>

      {/* Ask Eva Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <AskEvaQuizButton
          quizType="inflammation"
          quizResult={{
            level: result.inflammation_level,
            score: result.total_inflammation_score
          }}
        />
      </motion.div>

      {/* Download Results PDF */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-lavender-bg to-soft-white rounded-3xl p-8 border-2 border-primary-purple/20 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Download className="w-6 h-6 text-primary-purple" />
          <h3 className="text-h4 font-bold text-deep-navy">Скачать результаты</h3>
        </div>
        <p className="text-body text-deep-navy/70 mb-6">
          Сохраните результаты квиза в PDF для консультации с врачом
        </p>
        <DownloadQuizPDFButton
          quizType="inflammation"
          quizData={{
            total_inflammation_score: result.total_inflammation_score,
            inflammation_level: result.inflammation_level,
            diet_score: result.diet_score,
            lifestyle_score: result.lifestyle_score,
            bmi_score: result.bmi_score,
            waist_score: result.waist_score,
            bmi: result.bmi,
            high_risk_categories: result.high_risk_categories,
            demographics: demographics,
            recommendations: getRecommendations(),
          }}
        />
      </motion.div>

      {/* Download Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-primary-purple/10 via-ocean-wave-start/10 to-warm-accent/10 rounded-3xl p-8 border-2 border-primary-purple/20 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-primary-purple" />
          <h3 className="text-h4 font-bold text-deep-navy">Получите полный план действий</h3>
        </div>
        <p className="text-body text-deep-navy/70 mb-6">
          Скачайте PDF-гайд &quot;Противовоспалительное питание&quot; с детальными рекомендациями, рецептами и планом на 21 день
        </p>
        <DownloadGuideButton label="Скачать PDF-гайд" />
      </motion.div>

      {/* Download Lab Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-lavender-bg to-soft-white rounded-3xl p-8 border-2 border-primary-purple/20 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-primary-purple" />
          <h3 className="text-h4 font-bold text-deep-navy">Чек-лист лабораторных анализов</h3>
        </div>
        <p className="text-body text-deep-navy/70 mb-6">
          Скачайте подробный чек-лист анализов, которые рекомендуется сдавать в период менопаузы. Возьмите его с собой на приём к врачу.
        </p>
        <DownloadLabChecklistButton label="Скачать чек-лист анализов" />
      </motion.div>

      {/* Save to Collection Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex justify-center"
      >
        <SaveToCollectionButton
          contentType="quiz"
          contentId="inflammation"
          title="Индекс воспаления"
          description={`Уровень воспаления: ${levelLabel}. Общий балл: ${result.total_inflammation_score}.`}
          url="/quiz/inflammation"
          metadata={{
            inflammation_level: result.inflammation_level,
            total_score: result.total_inflammation_score,
          }}
        />
      </motion.div>
    </div>
  )
}

