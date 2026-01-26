'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { MRS_QUESTIONS, MRS_OPTIONS } from '@/lib/mrs-quiz/questions'
import { calculateMRSScore, getMRSSeverityLabel, getMRSSeverityDescription, getMRSSeverityColor, getMRSSeverityEmoji } from '@/lib/mrs-quiz/scoring'
import type { MRSQuestion, MRSAnswer, MRSResult } from '@/lib/types/mrs-quiz'
import { QuizQuestionCard } from './QuizQuestionCard'
import { QuizProgressBar } from './QuizProgressBar'
import { MRSQuizResults } from './MRSQuizResults'
import { QuizHistory } from './QuizHistory'
import { BackButton } from '@/components/ui/BackButton'
import { assetUrl } from '@/lib/assets'

type QuizStep = 'intro' | 'questions' | 'results'

export const MRSQuizInterface: FC = () => {
  const [step, setStep] = useState<QuizStep>('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<MRSAnswer>>({})
  const [result, setResult] = useState<MRSResult | null>(null)

  const currentQuestion = MRS_QUESTIONS[currentQuestionIndex]
  const totalQuestions = MRS_QUESTIONS.length
  const answeredQuestions = Object.keys(answers).length
  const progress = step === 'intro' ? 0 : step === 'results' ? 100 : (answeredQuestions / totalQuestions) * 100

  const handleAnswer = (value: number) => {
    const key = currentQuestion.id
    setAnswers(prev => ({ ...prev, [key]: value }))

    // Переход к следующему вопросу
    if (currentQuestionIndex < MRS_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Рассчитываем результаты
      const fullAnswers: MRSAnswer = {
        hot_flashes: answers.hot_flashes ?? 0,
        heart_discomfort: answers.heart_discomfort ?? 0,
        sleep_problems: answers.sleep_problems ?? 0,
        depressive_mood: answers.depressive_mood ?? 0,
        irritability: answers.irritability ?? 0,
        anxiety: answers.anxiety ?? 0,
        physical_mental_exhaustion: answers.physical_mental_exhaustion ?? 0,
        sexual_problems: answers.sexual_problems ?? 0,
        bladder_problems: answers.bladder_problems ?? 0,
        vaginal_dryness: answers.vaginal_dryness ?? 0,
        joint_muscle_pain: answers.joint_muscle_pain ?? 0
      }
      const calculatedResult = calculateMRSScore(fullAnswers)
      setResult(calculatedResult)
      setStep('results')
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleStart = () => {
    setStep('questions')
    setCurrentQuestionIndex(0)
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-soft-white to-white min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton variant="ghost" />
        </div>
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          {step !== 'intro' && step !== 'results' && (
            <QuizProgressBar progress={progress} current={answeredQuestions + 1} total={totalQuestions} />
          )}

          <AnimatePresence mode="wait">
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* История результатов (если есть) */}
                <QuizHistory testType="mrs" onStartNew={handleStart} />

                <div className="text-center space-y-8">
                  <div className="flex items-center justify-center mx-auto">
                    <Image
                      src={assetUrl('/logo.png')}
                      alt="Без |Паузы"
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>

                  <div>
                    <h1 className="text-h1 font-bold text-deep-navy mb-4 bg-gradient-to-r from-primary-purple to-ocean-wave-start bg-clip-text text-transparent">
                      Menopause Rating Scale (MRS)
                    </h1>
                    <p className="text-body-large text-deep-navy/70">
                      Стандартный опросник для оценки симптомов менопаузы. Оцените уровень тяжести ваших симптомов и получите рекомендации.
                    </p>
                  </div>

                <div className="bg-gradient-to-br from-lavender-bg to-soft-white rounded-3xl p-8 border-2 border-primary-purple/20 shadow-lg space-y-6">
                  <div className="flex items-center gap-3 justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary-purple" />
                    <h3 className="text-h4 font-semibold text-deep-navy">Что вы получите:</h3>
                  </div>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-purple mt-0.5 flex-shrink-0" />
                      <span className="text-body text-deep-navy/80">
                        Оценку уровня тяжести симптомов менопаузы по международной шкале MRS
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-purple mt-0.5 flex-shrink-0" />
                      <span className="text-body text-deep-navy/80">
                        Детализацию по категориям: соматические, психологические, урогенитальные симптомы
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-purple mt-0.5 flex-shrink-0" />
                      <span className="text-body text-deep-navy/80">
                        Персонализированные рекомендации на основе ваших результатов
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-purple mt-0.5 flex-shrink-0" />
                      <span className="text-body text-deep-navy/80">
                        {totalQuestions} вопросов • 3-5 минут • Бесплатно
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={handleStart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
                >
                  <span>Начать квиз</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <p className="text-caption text-deep-navy/60">
                  Ваши данные конфиденциальны и не будут переданы третьим лицам
                </p>
                </div>
              </motion.div>
            )}

            {step === 'questions' && currentQuestion && (
              <motion.div
                key={`question-${currentQuestionIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MRSQuestionCard
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={totalQuestions}
                  onAnswer={handleAnswer}
                  onBack={handleBack}
                  currentAnswer={answers[currentQuestion.id]}
                />
              </motion.div>
            )}

            {step === 'results' && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MRSQuizResults 
                  result={result} 
                  answers={{
                    hot_flashes: answers.hot_flashes ?? 0,
                    heart_discomfort: answers.heart_discomfort ?? 0,
                    sleep_problems: answers.sleep_problems ?? 0,
                    depressive_mood: answers.depressive_mood ?? 0,
                    irritability: answers.irritability ?? 0,
                    anxiety: answers.anxiety ?? 0,
                    physical_mental_exhaustion: answers.physical_mental_exhaustion ?? 0,
                    sexual_problems: answers.sexual_problems ?? 0,
                    bladder_problems: answers.bladder_problems ?? 0,
                    vaginal_dryness: answers.vaginal_dryness ?? 0,
                    joint_muscle_pain: answers.joint_muscle_pain ?? 0
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

// MRS-specific question card component
interface MRSQuestionCardProps {
  question: MRSQuestion
  questionNumber: number
  totalQuestions: number
  onAnswer: (value: number) => void
  onBack: () => void
  currentAnswer?: number
}

const MRSQuestionCard: FC<MRSQuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  currentAnswer
}) => {
  const getCategoryIcon = () => {
    switch (question.category) {
      case 'somatic':
        return '💪'
      case 'psychological':
        return '🧠'
      case 'urogenital':
        return '🌸'
      default:
        return '❓'
    }
  }

  const getCategoryColor = () => {
    switch (question.category) {
      case 'somatic':
        return 'from-ocean-wave-start/10 to-ocean-wave-end/10'
      case 'psychological':
        return 'from-primary-purple/10 to-warm-accent/10'
      case 'urogenital':
        return 'from-warm-accent/10 to-primary-purple/10'
      default:
        return 'from-lavender-bg to-soft-white'
    }
  }

  const getCategoryLabel = () => {
    switch (question.category) {
      case 'somatic':
        return 'Соматические симптомы'
      case 'psychological':
        return 'Психологические симптомы'
      case 'urogenital':
        return 'Урогенитальные симптомы'
      default:
        return 'Симптомы'
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
            {getCategoryLabel()}
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
        <div className="space-y-3 mb-8">
          {MRS_OPTIONS.map((option, index) => {
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

          {currentAnswer !== undefined && (
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
    </motion.div>
  )
}

