'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Calculator } from 'lucide-react'
import Image from 'next/image'
import { WHR_QUESTIONS } from '@/lib/whr-quiz/questions'
import { calculateWHRScore, getRiskLabel, getRiskColor, getRiskEmoji } from '@/lib/whr-quiz/scoring'
import type { WHRQuestion, WHRAnswers, WHRResults } from '@/lib/types/whr-quiz'
import { QuizProgressBar } from './QuizProgressBar'
import { SaveResultsButton } from './SaveResultsButton'
import { AskEvaQuizButton } from './AskEvaQuizButton'
import { DownloadQuizPDFButton } from './DownloadQuizPDFButton'
import { BackButton } from '@/components/ui/BackButton'

type QuizStep = 'intro' | 'questions' | 'results'

export const WHRQuizInterface: FC = () => {
  const [step, setStep] = useState<QuizStep>('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<WHRAnswers>>({})
  const [result, setResult] = useState<WHRResults | null>(null)

  const currentQuestion = WHR_QUESTIONS[currentQuestionIndex]
  const totalQuestions = WHR_QUESTIONS.length
  const answeredQuestions = Object.keys(answers).length
  const progress = step === 'intro' ? 0 : step === 'results' ? 100 : (answeredQuestions / totalQuestions) * 100

  const handleAnswer = (value: number | undefined) => {
    const key = currentQuestion.id
    
    if (value === undefined || value === null || isNaN(value)) {
      if (!currentQuestion.required) {
        setAnswers(prev => {
          const newAnswers = { ...prev }
          delete newAnswers[key]
          return newAnswers
        })
      }
      return
    }

    // Проверка границ
    if (currentQuestion.min !== undefined && value < currentQuestion.min) {
      return
    }
    if (currentQuestion.max !== undefined && value > currentQuestion.max) {
      return
    }

    setAnswers(prev => ({ ...prev, [key]: value }))

    // Автоматический переход к следующему вопросу
    if (currentQuestionIndex < WHR_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1)
      }, 300)
    } else {
      // Рассчитываем результаты
      const fullAnswers: WHRAnswers = {
        height: answers.height as number,
        weight: answers.weight as number,
        waist: answers.waist as number,
        hip: answers.hip as number,
      }
      const calculatedResult = calculateWHRScore(fullAnswers)
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
    setAnswers({})
  }

  const handleInputChange = (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      handleAnswer(numValue)
    } else if (value === '') {
      setAnswers(prev => {
        const newAnswers = { ...prev }
        delete newAnswers[currentQuestion.id]
        return newAnswers
      })
    }
  }

  const getAnswerValue = (): string => {
    const value = answers[currentQuestion.id]
    return value !== undefined ? String(value) : ''
  }

  const canProceed = () => {
    if (!currentQuestion.required) return true
    const value = answers[currentQuestion.id]
    return value !== undefined && value !== null && !isNaN(value)
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
                <div className="text-center space-y-8">
                  <div className="flex items-center justify-center mx-auto">
                    <Image
                      src="/logo.png"
                      alt="Без |Паузы"
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>

                  <div>
                    <h1 className="text-h1 font-bold text-deep-navy mb-4 bg-gradient-to-r from-primary-purple to-ocean-wave-start bg-clip-text text-transparent">
                      Калькулятор метаболического здоровья
                    </h1>
                    <p className="text-body-large text-deep-navy/70">
                      Оцените распределение жира в теле и метаболические риски. Рассчитайте ИМТ, WHR (соотношение талии и бёдер) и WHtR (соотношение талии и роста).
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
                          Расчет ИМТ (индекс массы тела) и оценку вашей категории веса
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple mt-0.5 flex-shrink-0" />
                        <span className="text-body text-deep-navy/80">
                          Расчет WHR (соотношение талии и бёдер) — важный показатель метаболического здоровья
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple mt-0.5 flex-shrink-0" />
                        <span className="text-body text-deep-navy/80">
                          Расчет WHtR (соотношение талии и роста) — более точный показатель рисков
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
                          {totalQuestions} вопроса • 3-5 минут • Бесплатно
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
                    <Calculator className="w-5 h-5" />
                    Начать расчет
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'questions' && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-soft-white to-lavender-bg rounded-3xl p-6 md:p-8 border-2 border-primary-purple/20 shadow-lg">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-body-small text-deep-navy/60">
                        Вопрос {currentQuestionIndex + 1} из {totalQuestions}
                      </span>
                    </div>
                    <h2 className="text-h3 font-bold text-deep-navy mb-2">
                      {currentQuestion.text}
                    </h2>
                    {currentQuestion.placeholder && (
                      <p className="text-body-small text-deep-navy/60 mb-4">
                        {currentQuestion.placeholder}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={getAnswerValue()}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder={currentQuestion.placeholder}
                        min={currentQuestion.min}
                        max={currentQuestion.max}
                        step={currentQuestion.step || 1}
                        className="w-full px-4 py-3 rounded-xl border-2 border-primary-purple/20 focus:border-primary-purple focus:outline-none text-body font-medium text-deep-navy bg-white"
                        autoFocus
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-body text-deep-navy/60 font-medium">
                        {currentQuestion.unit}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-4">
                      <motion.button
                        onClick={handleBack}
                        disabled={currentQuestionIndex === 0}
                        whileHover={{ scale: currentQuestionIndex === 0 ? 1 : 1.05 }}
                        whileTap={{ scale: currentQuestionIndex === 0 ? 1 : 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 text-deep-navy/70 hover:text-deep-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Назад
                      </motion.button>

                      {canProceed() && currentQuestionIndex < totalQuestions - 1 && (
                        <motion.button
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-6 py-2 bg-gradient-primary text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                        >
                          Далее
                          <ArrowRight className="w-5 h-5" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'results' && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main Result Card */}
                <div className={`bg-gradient-to-br ${getRiskColor(result.overallRisk)} rounded-3xl p-8 md:p-10 border-2 border-primary-purple/20 shadow-lg relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-purple/5 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-ocean-wave-start/5 rounded-full blur-2xl -ml-12 -mb-12" />

                  <div className="relative z-10 text-center space-y-6">
                    <div className="text-6xl mb-4">{getRiskEmoji(result.overallRisk)}</div>
                    <h1 className="text-h1 font-bold text-deep-navy mb-2">
                      {getRiskLabel(result.overallRisk)}
                    </h1>
                    <p className="text-body-large text-deep-navy/80 leading-relaxed max-w-2xl mx-auto">
                      Ваши показатели метаболического здоровья
                    </p>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl p-6 border-2 border-primary-purple/20 shadow-md">
                    <div className="text-center">
                      <div className="text-body-small text-deep-navy/60 mb-2">ИМТ</div>
                      <div className="text-h3 font-bold text-deep-navy mb-1">
                        {result.bmi.toFixed(1)}
                      </div>
                      <div className="text-body-small text-deep-navy/70 capitalize">
                        {result.bmiCategory === 'underweight' && 'Недостаточный вес'}
                        {result.bmiCategory === 'normal' && 'Норма'}
                        {result.bmiCategory === 'overweight' && 'Избыточный вес'}
                        {result.bmiCategory === 'obese' && 'Ожирение'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border-2 border-primary-purple/20 shadow-md">
                    <div className="text-center">
                      <div className="text-body-small text-deep-navy/60 mb-2">WHR</div>
                      <div className="text-h3 font-bold text-deep-navy mb-1">
                        {result.whr.toFixed(2)}
                      </div>
                      <div className="text-body-small text-deep-navy/70">
                        {result.whrCategory === 'low' && 'Низкий риск'}
                        {result.whrCategory === 'moderate' && 'Умеренный риск'}
                        {result.whrCategory === 'high' && 'Высокий риск'}
                        {result.whrCategory === 'very_high' && 'Очень высокий риск'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border-2 border-primary-purple/20 shadow-md">
                    <div className="text-center">
                      <div className="text-body-small text-deep-navy/60 mb-2">WHtR</div>
                      <div className="text-h3 font-bold text-deep-navy mb-1">
                        {result.whtr.toFixed(2)}
                      </div>
                      <div className="text-body-small text-deep-navy/70">
                        {result.whtrCategory === 'low' && 'Низкий риск'}
                        {result.whtrCategory === 'moderate' && 'Умеренный риск'}
                        {result.whtrCategory === 'high' && 'Высокий риск'}
                        {result.whtrCategory === 'very_high' && 'Очень высокий риск'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="bg-gradient-to-br from-primary-purple/5 to-ocean-wave-start/5 rounded-2xl p-6 border-2 border-primary-purple/20 shadow-md">
                    <h3 className="text-h4 font-bold text-deep-navy mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-primary-purple" />
                      Рекомендации
                    </h3>
                    <ul className="space-y-3">
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-body text-deep-navy/80">
                          <span className="text-primary-purple mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-deep-navy/10">
                  <SaveResultsButton
                    quizType="whr"
                    whrData={{
                      result,
                      answers: answers as WHRAnswers,
                    }}
                  />
                  <DownloadQuizPDFButton
                    quizType="whr"
                    quizData={{
                      result,
                      answers: answers as WHRAnswers,
                    }}
                  />
                  <AskEvaQuizButton
                    quizType="whr"
                    result={result}
                    answers={answers as WHRAnswers}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

