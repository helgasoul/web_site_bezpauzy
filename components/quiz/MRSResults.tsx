'use client'

import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, CheckCircle2, Info, ArrowRight, Save } from 'lucide-react'
import Link from 'next/link'
import { MRSResults as MRSResultsType } from './MRSQuiz'
import { SaveResultsModal } from './SaveResultsModal'

interface MRSResultsProps {
  results: MRSResultsType
}

export const MRSResults: FC<MRSResultsProps> = ({ results }) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  const severityLabels = {
    mild: { label: 'Лёгкая', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    moderate: { label: 'Умеренная', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    severe: { label: 'Выраженная', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  }

  const severityInfo = severityLabels[results.severity]

  const handleDownloadPDF = async () => {
    try {
      // Import and use the PDF generation function
      const { generateMRSReportPDF } = await import('@/lib/pdf/generateMRSReport')
      await generateMRSReportPDF(results)
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error)
      alert('Не удалось сгенерировать PDF. Пожалуйста, попробуйте позже.')
    }
  }

  const handleSaveSuccess = () => {
    // Results are saved, modal will close automatically
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl p-8 md:p-12 shadow-card"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-h2 font-bold text-deep-navy mb-4">
            Результаты оценки симптомов
          </h2>
          <p className="text-body-large text-deep-navy/70">
            Ваша оценка основана на Menopause Rating Scale (MRS)
          </p>
        </div>

        {/* Total Score */}
        <div className={`${severityInfo.bgColor} ${severityInfo.borderColor} border-2 rounded-card p-6 mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-deep-navy/70 mb-1">Общий балл</p>
              <p className="text-4xl font-bold text-deep-navy">{results.totalScore}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-deep-navy/70 mb-1">Степень тяжести</p>
              <p className={`text-2xl font-bold ${severityInfo.color}`}>
                {severityInfo.label}
              </p>
            </div>
          </div>
          <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                results.severity === 'mild'
                  ? 'bg-green-500'
                  : results.severity === 'moderate'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${(results.totalScore / 44) * 100}%` }}
              transition={{ delay: 0.5, duration: 1 }}
            />
          </div>
          <p className="text-xs text-deep-navy/60 mt-2">
            Максимальный балл: 44 (11 вопросов × 4 балла)
          </p>
        </div>

        {/* Category Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-lavender-bg rounded-card p-4">
            <p className="text-sm font-semibold text-deep-navy/70 mb-1">Вазомоторные симптомы</p>
            <p className="text-2xl font-bold text-deep-navy">{results.vasomotorScore}</p>
            <p className="text-xs text-deep-navy/60 mt-1">Приливы, ночная потливость</p>
          </div>
          <div className="bg-lavender-bg rounded-card p-4">
            <p className="text-sm font-semibold text-deep-navy/70 mb-1">Психоэмоциональные</p>
            <p className="text-2xl font-bold text-deep-navy">{results.psychologicalScore}</p>
            <p className="text-xs text-deep-navy/60 mt-1">Сон, настроение, усталость</p>
          </div>
          <div className="bg-lavender-bg rounded-card p-4">
            <p className="text-sm font-semibold text-deep-navy/70 mb-1">Урогенитальные</p>
            <p className="text-2xl font-bold text-deep-navy">{results.urogenitalScore}</p>
            <p className="text-xs text-deep-navy/60 mt-1">Мочевой пузырь, сухость</p>
          </div>
          <div className="bg-lavender-bg rounded-card p-4">
            <p className="text-sm font-semibold text-deep-navy/70 mb-1">Соматические</p>
            <p className="text-2xl font-bold text-deep-navy">{results.somaticScore}</p>
            <p className="text-xs text-deep-navy/60 mt-1">Сексуальные проблемы, боли</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-br from-primary-purple/5 to-ocean-wave-start/5 rounded-card p-6 mb-8 border border-primary-purple/20">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-6 h-6 text-primary-purple flex-shrink-0 mt-1" />
            <h3 className="text-h4 font-bold text-deep-navy">Персонализированные рекомендации</h3>
          </div>
          <ul className="space-y-3">
            {results.recommendations.map((rec, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                <p className="text-body text-deep-navy/80">{rec}</p>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="bg-lavender-bg rounded-card p-6 mb-8">
          <h3 className="text-h4 font-bold text-deep-navy mb-4">Что делать дальше?</h3>
          <ul className="space-y-3 text-body text-deep-navy/80">
            <li className="flex items-start gap-3">
              <span className="text-primary-purple font-bold">1.</span>
              <span>Сохраните результаты этого опросника (скачайте PDF ниже)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-purple font-bold">2.</span>
              <span>Запишитесь на приём к гинекологу, специализирующемуся на менопаузе</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-purple font-bold">3.</span>
              <span>Возьмите результаты опросника с собой на приём</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary-purple font-bold">4.</span>
              <span>Обсудите с врачом возможность ЗГТ или других методов лечения</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-strong hover:scale-[1.02] transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            Скачать результаты (PDF)
          </button>
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-primary-purple text-primary-purple px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300"
          >
            <Save className="w-5 h-5" />
            Сохранить мои результаты
          </button>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-primary-purple text-primary-purple px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300"
          >
            Спросить Еву
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Save Results Modal */}
        <SaveResultsModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          results={results}
          onSaveSuccess={handleSaveSuccess}
        />

        {/* Disclaimer */}
        <p className="text-xs text-deep-navy/60 text-center mt-8">
          Этот опросник не заменяет консультацию врача. Результаты носят информационный характер и не являются диагнозом.
        </p>
      </div>
    </motion.div>
  )
}

