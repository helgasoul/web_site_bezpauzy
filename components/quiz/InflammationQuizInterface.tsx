'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, TrendingDown, Heart, Brain } from 'lucide-react'
import Image from 'next/image'
import { ALL_QUESTIONS, DEMOGRAPHICS_QUESTIONS, DIET_QUESTIONS, LIFESTYLE_QUESTIONS } from '@/lib/inflammation-quiz/questions'
import { calculateInflammationScore, getInflammationLevelLabel, getInflammationLevelDescription, getInflammationLevelColor, getInflammationLevelEmoji } from '@/lib/inflammation-quiz/scoring'
import type { InflammationQuestion, Demographics, InflammationAnswers, InflammationResult, AgeRange } from '@/lib/types/inflammation-quiz'
import { QuizQuestionCard } from './QuizQuestionCard'
import { QuizProgressBar } from './QuizProgressBar'
import { QuizResults } from './QuizResults'
import { QuizHistory } from './QuizHistory'
import { BackButton } from '@/components/ui/BackButton'
import { assetUrl } from '@/lib/assets'

type QuizStep = 'intro' | 'demographics' | 'diet' | 'lifestyle' | 'results'

export const InflammationQuizInterface: FC = () => {
  const [step, setStep] = useState<QuizStep>('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [demographics, setDemographics] = useState<Partial<Demographics>>({})
  const [answers, setAnswers] = useState<Partial<InflammationAnswers>>({})
  const [result, setResult] = useState<InflammationResult | null>(null)
  const [fullAnswers, setFullAnswers] = useState<InflammationAnswers | null>(null)

  const getCurrentQuestions = (): InflammationQuestion[] => {
    switch (step) {
      case 'demographics':
        return DEMOGRAPHICS_QUESTIONS
      case 'diet':
        return DIET_QUESTIONS
      case 'lifestyle':
        return LIFESTYLE_QUESTIONS
      default:
        return []
    }
  }

  const currentQuestions = getCurrentQuestions()
  const currentQuestion = currentQuestions[currentQuestionIndex]
  
  const calculateAndShowResults = () => {
    // Рассчитываем результаты
    const fullDemographics = {
      age_range: demographics.age_range!,
      height_cm: demographics.height_cm!,
      weight_kg: demographics.weight_kg!,
      waist_circumference_cm: demographics.waist_circumference_cm
    } as Demographics
    
    // Заполняем недостающие ответы нулями
    const completeAnswers: InflammationAnswers = {
      diet_leafy_greens: answers.diet_leafy_greens ?? 0,
      diet_berries: answers.diet_berries ?? 0,
      diet_fatty_fish: answers.diet_fatty_fish ?? 0,
      diet_nuts: answers.diet_nuts ?? 0,
      diet_olive_oil: answers.diet_olive_oil ?? 0,
      diet_whole_grains: answers.diet_whole_grains ?? 0,
      diet_legumes: answers.diet_legumes ?? 0,
      diet_turmeric_spices: answers.diet_turmeric_spices ?? 0,
      diet_processed_meat: answers.diet_processed_meat ?? 0,
      diet_red_meat: answers.diet_red_meat ?? 0,
      diet_refined_carbs: answers.diet_refined_carbs ?? 0,
      diet_sugary_drinks: answers.diet_sugary_drinks ?? 0,
      diet_fried_foods: answers.diet_fried_foods ?? 0,
      diet_alcohol: answers.diet_alcohol ?? 0,
      diet_trans_fats: answers.diet_trans_fats ?? 0,
      lifestyle_physical_activity: answers.lifestyle_physical_activity ?? 0,
      lifestyle_sleep_duration: answers.lifestyle_sleep_duration ?? 0,
      lifestyle_sleep_quality: answers.lifestyle_sleep_quality ?? 0,
      lifestyle_stress_level: answers.lifestyle_stress_level ?? 0,
      lifestyle_smoking: answers.lifestyle_smoking ?? 0,
      lifestyle_sitting_time: answers.lifestyle_sitting_time ?? 0,
      lifestyle_stress_management: answers.lifestyle_stress_management ?? 0
    }
    
    setFullAnswers(completeAnswers)
    const calculatedResult = calculateInflammationScore(fullDemographics, completeAnswers)
    setResult(calculatedResult)
    setStep('results')
  }

  const handleNext = () => {
    // Переход к следующему вопросу при нажатии кнопки "Далее"
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Переход к следующему разделу
      if (step === 'demographics') {
        setStep('diet')
        setCurrentQuestionIndex(0)
      } else if (step === 'diet') {
        setStep('lifestyle')
        setCurrentQuestionIndex(0)
      } else if (step === 'lifestyle') {
        calculateAndShowResults()
      }
    }
  }
  
  // Подсчет прогресса
  const getProgress = () => {
    if (step === 'intro') return 0
    if (step === 'results') return 100
    
    let answered = 0
    if (step === 'demographics') {
      answered = Object.keys(demographics).filter(k => demographics[k as keyof Demographics] !== undefined).length
      return (answered / DEMOGRAPHICS_QUESTIONS.length) * 100
    } else if (step === 'diet') {
      const demoAnswered = DEMOGRAPHICS_QUESTIONS.length
      answered = Object.keys(answers).filter(k => {
        const key = k as keyof InflammationAnswers
        return answers[key] !== undefined && DIET_QUESTIONS.some(q => q.id === k)
      }).length
      return ((demoAnswered + answered) / totalQuestions) * 100
    } else if (step === 'lifestyle') {
      const demoAnswered = DEMOGRAPHICS_QUESTIONS.length
      const dietAnswered = DIET_QUESTIONS.length
      answered = Object.keys(answers).filter(k => {
        const key = k as keyof InflammationAnswers
        return answers[key] !== undefined && LIFESTYLE_QUESTIONS.some(q => q.id === k)
      }).length
      return ((demoAnswered + dietAnswered + answered) / totalQuestions) * 100
    }
    return 0
  }
  
  const totalQuestions = ALL_QUESTIONS.length
  const progress = getProgress()
  const currentQuestionNumber = step === 'demographics' 
    ? currentQuestionIndex + 1
    : step === 'diet'
    ? DEMOGRAPHICS_QUESTIONS.length + currentQuestionIndex + 1
    : DEMOGRAPHICS_QUESTIONS.length + DIET_QUESTIONS.length + currentQuestionIndex + 1

  const handleAnswer = (value: number | string, shouldAdvance: boolean = true) => {
    if (step === 'demographics') {
      const key = currentQuestion.id as keyof Demographics
      // Для числовых полей преобразуем в число, если это не пустая строка
      if (key === 'height_cm' || key === 'weight_kg' || key === 'waist_circumference_cm') {
        if (value === '' || value === null || value === undefined) {
          // Не сохраняем пустые значения для числовых полей, но не переходим дальше
          setDemographics(prev => {
            const newState = { ...prev }
            delete newState[key]
            return newState
          })
          return
        }
        const numValue = typeof value === 'string' ? Number(value) : value
        if (!isNaN(numValue) && numValue > 0) {
          setDemographics(prev => ({ ...prev, [key]: numValue }))
        } else {
          return // Невалидное число, не переходим дальше
        }
      } else {
        // Для нечисловых полей (age_range) сохраняем как есть
        // Проверяем, что value соответствует типу AgeRange
        if (key === 'age_range' && typeof value === 'string') {
          const validAgeRanges: AgeRange[] = ['35-39', '40-44', '45-49', '50-54', '55-59', '60+']
          if (validAgeRanges.includes(value as AgeRange)) {
            setDemographics(prev => ({ ...prev, [key]: value as AgeRange }))
          }
        } else {
          // Для других нечисловых полей (если они появятся)
          setDemographics(prev => ({ ...prev, [key]: value as any }))
        }
      }
    } else {
      const key = currentQuestion.id as keyof InflammationAnswers
      setAnswers(prev => ({ ...prev, [key]: value as number }))
    }

    // Переход к следующему вопросу только если shouldAdvance = true
    if (shouldAdvance) {
      handleNext()
    }
  }

  const handleSkip = () => {
    // Пропуск опционального вопроса (например, окружность талии)
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Переход к следующему разделу
      if (step === 'demographics') {
        setStep('diet')
        setCurrentQuestionIndex(0)
      } else if (step === 'diet') {
        setStep('lifestyle')
        setCurrentQuestionIndex(0)
      }
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    } else {
      if (step === 'diet') {
        setStep('demographics')
        setCurrentQuestionIndex(DEMOGRAPHICS_QUESTIONS.length - 1)
      } else if (step === 'lifestyle') {
        setStep('diet')
        setCurrentQuestionIndex(DIET_QUESTIONS.length - 1)
      }
    }
  }

  const handleStart = () => {
    setStep('demographics')
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
            <QuizProgressBar progress={progress} current={currentQuestionNumber} total={totalQuestions} />
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
                <QuizHistory testType="inflammation" onStartNew={handleStart} />

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
                      Индекс воспаления
                    </h1>
                    <p className="text-body-large text-deep-navy/70">
                      Узнайте уровень хронического воспаления в вашем организме и получите персонализированные рекомендации
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
                        Оценку уровня воспаления на основе питания и образа жизни
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-purple mt-0.5 flex-shrink-0" />
                      <span className="text-body text-deep-navy/80">
                        Персонализированные рекомендации по снижению воспаления
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-purple mt-0.5 flex-shrink-0" />
                      <span className="text-body text-deep-navy/80">
                        PDF-гайд с планом действий и рецептами
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-purple mt-0.5 flex-shrink-0" />
                      <span className="text-body text-deep-navy/80">
                        {totalQuestions} вопросов • 5-7 минут • Бесплатно
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={handleStart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-warm-accent to-primary-purple text-white px-8 py-4 rounded-full text-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
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

            {step !== 'intro' && step !== 'results' && currentQuestion && (
              <motion.div
                key={`${step}-${currentQuestionIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <QuizQuestionCard
                  question={currentQuestion}
                  questionNumber={currentQuestionNumber}
                  totalQuestions={totalQuestions}
                  onAnswer={(value) => {
                    // Для числовых и select полей не переходим автоматически, для radio - переходим
                    handleAnswer(value, currentQuestion.type === 'radio')
                  }}
                  onBack={handleBack}
                  onNext={(currentQuestion.type === 'number' || currentQuestion.type === 'select') ? handleNext : undefined}
                  onSkip={currentQuestion.id === 'waist_circumference_cm' ? handleSkip : undefined}
                  currentAnswer={
                    step === 'demographics'
                      ? demographics[currentQuestion.id as keyof Demographics] ?? ''
                      : answers[currentQuestion.id as keyof InflammationAnswers] ?? undefined
                  }
                />
              </motion.div>
            )}

            {step === 'results' && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <QuizResults 
                  result={result} 
                  demographics={demographics as Demographics}
                  answers={fullAnswers!}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
