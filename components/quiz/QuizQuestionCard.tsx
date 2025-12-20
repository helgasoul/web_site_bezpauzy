'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { InflammationQuestion } from '@/lib/types/inflammation-quiz'

interface QuizQuestionCardProps {
  question: InflammationQuestion
  questionNumber: number
  totalQuestions: number
  onAnswer: (value: number | string) => void
  onBack: () => void
  onNext?: () => void
  onSkip?: () => void
  currentAnswer?: number | string
}

export const QuizQuestionCard: FC<QuizQuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  onNext,
  onSkip,
  currentAnswer
}) => {
  const getCategoryIcon = () => {
    switch (question.category) {
      case 'demographics':
        return '👤'
      case 'diet':
        return '🥗'
      case 'lifestyle':
        return '💪'
      default:
        return '❓'
    }
  }

  const getCategoryColor = () => {
    switch (question.category) {
      case 'demographics':
        return 'from-primary-purple/10 to-ocean-wave-start/10'
      case 'diet':
        return 'from-ocean-wave-start/10 to-warm-accent/10'
      case 'lifestyle':
        return 'from-warm-accent/10 to-primary-purple/10'
      default:
        return 'from-lavender-bg to-soft-white'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-soft-white to-lavender-bg rounded-3xl p-8 md:p-10 border-2 border-primary-purple/20 shadow-lg relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-purple/5 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-ocean-wave-start/5 rounded-full blur-2xl -ml-12 -mb-12" />

      <div className="relative z-10">
        {/* Category badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getCategoryColor()} rounded-full mb-6`}>
          <span className="text-xl">{getCategoryIcon()}</span>
          <span className="text-body-small font-semibold text-deep-navy">
            {question.category === 'demographics' ? 'О вас' : question.category === 'diet' ? 'Питание' : 'Образ жизни'}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-h2 font-bold text-deep-navy mb-4">
          {question.question}
        </h2>

        {question.description && (
          <p className="text-body text-deep-navy/70 mb-8">
            {question.description}
          </p>
        )}

        {/* Options */}
        {question.type === 'radio' && question.options && (
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => {
              const isSelected = currentAnswer === option.value
              return (
                <motion.button
                  key={index}
                  onClick={() => onAnswer(option.value)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-purple/20 to-ocean-wave-start/20 border-primary-purple shadow-md'
                      : 'bg-white/60 border-lavender-bg hover:border-primary-purple/30 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'border-primary-purple bg-primary-purple'
                        : 'border-deep-navy/30'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-body font-medium text-deep-navy mb-1">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-body-small text-deep-navy/60">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}

        {question.type === 'number' && (
          <div className="mb-8">
            <input
              type="number"
              value={currentAnswer !== undefined && currentAnswer !== '' && currentAnswer !== null ? String(currentAnswer) : ''}
              onChange={(e) => {
                const value = e.target.value.trim()
                // Если поле пустое, передаем пустую строку
                if (value === '') {
                  onAnswer('')
                } else {
                  const numValue = Number(value)
                  // Проверяем, что это валидное число и оно в допустимом диапазоне
                  if (!isNaN(numValue) && numValue > 0) {
                    // Для веса используем точное число, для остальных - целое
                    if (question.id === 'weight_kg') {
                      onAnswer(parseFloat(value))
                    } else {
                      onAnswer(parseInt(value, 10))
                    }
                  }
                }
              }}
              onBlur={(e) => {
                // При потере фокуса проверяем валидность
                const value = e.target.value.trim()
                if (value !== '' && (isNaN(Number(value)) || Number(value) <= 0)) {
                  e.target.value = ''
                  onAnswer('')
                }
              }}
              min={question.validation?.min}
              max={question.validation?.max}
              step={question.id === 'weight_kg' ? '0.1' : '1'}
              placeholder="Введите значение"
              className="w-full px-6 py-4 rounded-2xl border-2 border-lavender-bg bg-white/60 text-body text-deep-navy focus:border-primary-purple focus:outline-none focus:ring-2 focus:ring-primary-purple/20 transition-all"
            />
            {question.validation && (
              <p className="text-body-small text-deep-navy/60 mt-2">
                Допустимый диапазон: {question.validation.min} - {question.validation.max}
                {question.id === 'weight_kg' && ' (можно использовать десятичные значения)'}
              </p>
            )}
          </div>
        )}

        {question.type === 'select' && question.options && (
          <div className="mb-8">
            <select
              value={currentAnswer || ''}
              onChange={(e) => onAnswer(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border-2 border-lavender-bg bg-white/60 text-body text-deep-navy focus:border-primary-purple focus:outline-none focus:ring-2 focus:ring-primary-purple/20 transition-all"
            >
              <option value="">Выберите вариант</option>
              {question.options.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 text-deep-navy hover:text-primary-purple transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-body font-medium">Назад</span>
          </motion.button>

          <div className="flex items-center gap-4">
            {question.id === 'waist_circumference_cm' && onSkip && (
              <motion.button
                onClick={onSkip}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-body-small text-deep-navy/60 hover:text-deep-navy transition-colors"
              >
                Пропустить
              </motion.button>
            )}
            {(question.type === 'number' || question.type === 'select') && onNext && (
              <motion.button
                onClick={onNext}
                disabled={
                  currentAnswer === undefined || 
                  currentAnswer === '' || 
                  (typeof currentAnswer === 'number' && currentAnswer <= 0)
                }
                whileHover={{ 
                  scale: currentAnswer && currentAnswer !== '' && (typeof currentAnswer !== 'number' || currentAnswer > 0) ? 1.05 : 1 
                }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  currentAnswer !== undefined && currentAnswer !== '' && (typeof currentAnswer !== 'number' || currentAnswer > 0)
                    ? 'bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white shadow-md hover:shadow-lg'
                    : 'bg-lavender-bg text-deep-navy/40 cursor-not-allowed'
                }`}
              >
                <span>Далее</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
            {currentAnswer !== undefined && currentAnswer !== '' && question.type === 'radio' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-body-small text-deep-navy/60"
              >
                <CheckCircle2 className="w-4 h-4 text-primary-purple" />
                <span>Ответ выбран</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

