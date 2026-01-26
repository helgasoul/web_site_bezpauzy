'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Bone, ExternalLink, Download, FileText } from 'lucide-react'
import Image from 'next/image'
import { FRAX_QUESTIONS } from '@/lib/frax-quiz/questions'
import { calculateFRAXScore } from '@/lib/frax-quiz/scoring'
import type { FRAXQuestion, FRAXAnswers, FRAXResults } from '@/lib/types/frax-quiz'
import { QuizProgressBar } from './QuizProgressBar'
import { SaveResultsButton } from './SaveResultsButton'
import { AskEvaQuizButton } from './AskEvaQuizButton'
import { DownloadQuizPDFButton } from './DownloadQuizPDFButton'
import { DownloadLabChecklistButton } from './DownloadLabChecklistButton'
import { SaveToCollectionButton } from '@/components/ui/SaveToCollectionButton'
import { BackButton } from '@/components/ui/BackButton'
import Link from 'next/link'

type QuizStep = 'intro' | 'questions' | 'results'

export const FRAXQuizInterface: FC = () => {
  const [step, setStep] = useState<QuizStep>('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<FRAXAnswers>>({})
  const [result, setResult] = useState<FRAXResults | null>(null)

  const currentQuestion = FRAX_QUESTIONS[currentQuestionIndex]
  const totalQuestions = FRAX_QUESTIONS.length
  const answeredQuestions = Object.keys(answers).length
  const progress = step === 'intro' ? 0 : step === 'results' ? 100 : (answeredQuestions / totalQuestions) * 100

  const handleAnswer = (value: string | number | boolean | undefined, shouldAdvance: boolean = true) => {
    const key = currentQuestion.id as keyof FRAXAnswers
    // Для опциональных полей сохраняем undefined, если значение не указано
    if (value === undefined || value === '') {
      // Для опциональных полей можно оставить undefined
      if (!currentQuestion.required) {
        setAnswers(prev => {
          const newAnswers = { ...prev }
          delete newAnswers[key]
          return newAnswers
        })
      } else {
        // Для обязательных полей не сохраняем пустое значение
        return
      }
    } else {
      setAnswers(prev => ({ ...prev, [key]: value }))
    }

    // Переход к следующему вопросу только если shouldAdvance = true
    // Для number полей shouldAdvance = false, чтобы не переходить автоматически
    if (shouldAdvance) {
      if (currentQuestionIndex < FRAX_QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        // Рассчитываем результаты
        const fullAnswers: FRAXAnswers = {
          age: answers.age as number,
          sex: answers.sex as 'female' | 'male',
          previous_fracture: answers.previous_fracture ?? false,
          parent_hip_fracture: answers.parent_hip_fracture ?? false,
          current_smoking: answers.current_smoking ?? false,
          glucocorticoids: answers.glucocorticoids ?? false,
          rheumatoid_arthritis: answers.rheumatoid_arthritis ?? false,
          secondary_osteoporosis: answers.secondary_osteoporosis ?? false,
          alcohol: answers.alcohol ?? false,
          bmd: answers.bmd,
          bmd_t_score: answers.bmd_t_score,
        }
        const calculatedResult = calculateFRAXScore(fullAnswers)
        setResult(calculatedResult)
        setStep('results')
      }
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
                    <h1 className="text-h1 font-bold text-deep-navy mb-4 bg-gradient-to-r from-primary-purple to-warm-accent bg-clip-text text-transparent">
                      Оценка риска переломов (FRAX)
                    </h1>
                    <p className="text-body-large text-deep-navy/70">
                      Оцените ваш 10-летний риск переломов на основе факторов риска остеопороза. Основано на международном инструменте FRAX®.
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
                          Оценку 10-летнего риска перелома бедра и основных остеопоротических переломов
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple mt-0.5 flex-shrink-0" />
                        <span className="text-body text-deep-navy/80">
                          Персонализированные рекомендации на основе ваших факторов риска
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple mt-0.5 flex-shrink-0" />
                        <span className="text-body text-deep-navy/80">
                          Информацию о необходимости денситометрии и консультации с врачом
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

                  <div className="bg-gradient-to-r from-primary-purple/10 to-warm-accent/10 rounded-card p-6 border border-primary-purple/20">
                    <p className="text-body-small text-deep-navy/70 mb-3">
                      <strong>Важно:</strong> Это упрощённая версия для образовательных целей. Для точной оценки используйте официальный FRAX калькулятор:
                    </p>
                    <a
                      href="https://www.sheffield.ac.uk/FRAX/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-purple hover:text-primary-purple/80 font-medium"
                    >
                      <span>Официальный FRAX калькулятор</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <motion.button
                    onClick={handleStart}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-primary-purple to-warm-accent text-white px-8 py-4 rounded-full text-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
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
                <FRAXQuestionCard
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={totalQuestions}
                  onAnswer={handleAnswer}
                  onBack={handleBack}
                  currentAnswer={answers[currentQuestion.id as keyof FRAXAnswers]}
                />
              </motion.div>
            )}

            {step === 'results' && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FRAXQuizResults result={result} answers={answers as FRAXAnswers} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

// FRAX Question Card Component
interface FRAXQuestionCardProps {
  question: FRAXQuestion
  questionNumber: number
  totalQuestions: number
  onAnswer: (value: string | number | boolean | undefined, shouldAdvance?: boolean) => void
  onBack: () => void
  currentAnswer?: string | number | boolean
}

const FRAXQuestionCard: FC<FRAXQuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onBack,
  currentAnswer
}) => {
  const handleValueChange = (value: string | number | boolean) => {
    // Для number полей только сохраняем значение, не переходим к следующему вопросу
    // Переход произойдет только при нажатии кнопки "Далее"
    if (question.type === 'number') {
      // Сохраняем значение, но не переходим к следующему вопросу (shouldAdvance = false)
      const numValue = value === '' || value === undefined ? undefined : Number(value)
      if (numValue !== undefined && !isNaN(numValue)) {
        onAnswer(numValue, false) // false = не переходить к следующему вопросу
      } else if (value === '' || value === undefined) {
        // Если поле пустое, сохраняем undefined
        onAnswer(undefined, false)
      }
    } else {
      // Для других типов вопросов (yes_no, select) сразу переходим к следующему
      onAnswer(value, true) // true = перейти к следующему вопросу
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-soft-white to-lavender-bg rounded-3xl p-8 md:p-10 border-2 border-primary-purple/20 shadow-lg relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-purple/5 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-warm-accent/5 rounded-full blur-2xl -ml-12 -mb-12" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple/10 to-warm-accent/10 rounded-full mb-6">
          <Bone className="w-5 h-5 text-primary-purple" />
          <span className="text-body-small font-semibold text-deep-navy">
            Вопрос {questionNumber} из {totalQuestions}
          </span>
        </div>

        <h2 className="text-h2 font-bold text-deep-navy mb-4">
          {question.question}
        </h2>

        {question.description && (
          <p className="text-body text-deep-navy/70 mb-8">
            {question.description}
          </p>
        )}

        {question.type === 'yes_no' && (
          <div className="space-y-3 mb-8">
            {[
              { value: true, label: 'Да' },
              { value: false, label: 'Нет' },
            ].map((option) => {
              const isSelected = currentAnswer === option.value
              return (
                <motion.button
                  key={String(option.value)}
                  onClick={() => handleValueChange(option.value)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-purple/20 to-warm-accent/20 border-primary-purple shadow-md'
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
                    <div className="text-body font-medium text-deep-navy">
                      {option.label}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}

        {question.type === 'select' && question.options && (
          <div className="space-y-3 mb-8">
            {question.options.map((option) => {
              const isSelected = currentAnswer === option.value
              return (
                <motion.button
                  key={String(option.value)}
                  onClick={() => handleValueChange(option.value)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-primary-purple/20 to-warm-accent/20 border-primary-purple shadow-md'
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
                    <div className="text-body font-medium text-deep-navy">
                      {option.label}
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
              value={currentAnswer !== undefined && currentAnswer !== '' && typeof currentAnswer !== 'boolean' ? String(currentAnswer) : ''}
              onChange={(e) => {
                // Сохраняем значение при вводе, но не переходим к следующему вопросу
                const inputValue = e.target.value
                if (inputValue === '') {
                  handleValueChange('')
                } else {
                  const numValue = Number(inputValue)
                  if (!isNaN(numValue)) {
                    handleValueChange(numValue)
                  }
                }
              }}
              className="w-full px-6 py-4 rounded-2xl border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-body font-medium text-deep-navy bg-white/60"
              placeholder="Введите значение"
              min={question.id === 'age' ? 18 : undefined}
              max={question.id === 'age' ? 120 : undefined}
            />
          </div>
        )}

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

            {/* Кнопка "Далее" или "Завершить" */}
            {/* Показывается всегда для опциональных вопросов или когда есть ответ для обязательных */}
            {(!question.required || currentAnswer !== undefined) && (
              <motion.button
                onClick={() => {
                  // Для опционального поля можно передать undefined, если поле пустое
                  const value = question.type === 'number' && (currentAnswer === '' || currentAnswer === undefined)
                    ? undefined 
                    : currentAnswer !== undefined && currentAnswer !== ''
                    ? currentAnswer 
                    : undefined
                  // При нажатии кнопки "Далее" переходим к следующему вопросу (shouldAdvance = true)
                  onAnswer(value, true)
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-warm-accent text-white rounded-full font-medium hover:shadow-button-hover transition-all"
              >
                <span>{questionNumber === totalQuestions ? 'Завершить' : 'Далее'}</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// FRAX Results Component
interface FRAXQuizResultsProps {
  result: FRAXResults
  answers: FRAXAnswers
}

const FRAXQuizResults: FC<FRAXQuizResultsProps> = ({ result, answers }) => {
  const getRiskColor = () => {
    switch (result.risk_level) {
      case 'low':
        return 'from-ocean-wave-start to-ocean-wave-end'
      case 'moderate':
        return 'from-warm-accent to-primary-purple'
      case 'high':
        return 'from-primary-purple to-warm-accent'
      default:
        return 'from-primary-purple to-ocean-wave-start'
    }
  }

  const getRiskLabel = () => {
    switch (result.risk_level) {
      case 'low':
        return 'Низкий риск'
      case 'moderate':
        return 'Умеренный риск'
      case 'high':
        return 'Высокий риск'
      default:
        return 'Неизвестно'
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-h2 font-bold text-deep-navy mb-4">
          Ваши результаты
        </h2>
      </div>

      <div className={`bg-gradient-to-r ${getRiskColor()} rounded-3xl p-8 text-white shadow-lg`}>
        <div className="text-center mb-6">
          <Bone className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h3 className="text-h3 font-bold mb-2">{getRiskLabel()}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6">
            <div className="text-3xl font-bold mb-2">
              {result.hip_fracture_risk_10y}%
            </div>
            <div className="text-white/90">
              10-летний риск перелома бедра
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6">
            <div className="text-3xl font-bold mb-2">
              {result.major_osteoporotic_fracture_risk_10y}%
            </div>
            <div className="text-white/90">
              10-летний риск основных остеопоротических переломов
            </div>
          </div>
        </div>
      </div>

      <div className="bg-lavender-bg rounded-3xl p-8 border-2 border-primary-purple/20">
        <h3 className="text-h4 font-semibold text-deep-navy mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-primary-purple" />
          Рекомендации
        </h3>
        <div className="space-y-4">
          {result.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-purple mt-2 flex-shrink-0" />
              <p className="text-body text-deep-navy/80">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-purple/10 to-warm-accent/10 rounded-card p-6 border border-primary-purple/20">
        <p className="text-body text-deep-navy/80 mb-4">
          <strong>Важно:</strong> Это упрощённая оценка для образовательных целей. Для точной оценки используйте официальный FRAX калькулятор:
        </p>
        <a
          href="https://www.sheffield.ac.uk/FRAX/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-warm-accent text-white rounded-full font-medium hover:shadow-button-hover transition-all"
        >
          <span>Открыть официальный FRAX калькулятор</span>
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>

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
          quizType="frax"
          fraxData={{ result, answers }}
        />
      </motion.div>

      {/* Ask Eva Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <AskEvaQuizButton
          quizType="frax"
          quizResult={{
            riskLevel: result.risk_level,
            hipFractureRisk: result.hip_fracture_risk_10y,
            majorFractureRisk: result.major_osteoporotic_fracture_risk_10y
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
          <Download className="w-6 h-6 text-primary-purple" />
          <h3 className="text-h4 font-bold text-deep-navy">Обсудите результаты с врачом</h3>
        </div>
        <p className="text-body text-deep-navy/70 mb-6">
          Результаты этого квиза помогут вам и вашему врачу оценить риск переломов и принять решение о необходимости лечения.
        </p>
        <DownloadQuizPDFButton
          quizType="frax"
          quizData={{
            hip_fracture_risk_10y: result.hip_fracture_risk_10y,
            major_osteoporotic_fracture_risk_10y: result.major_osteoporotic_fracture_risk_10y,
            risk_level: result.risk_level,
            recommendations: result.recommendations,
            answers: answers,
          }}
        />
      </motion.div>

      {/* Download Lab Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-warm-accent/10 via-ocean-wave-start/10 to-primary-purple/10 rounded-3xl p-8 border-2 border-warm-accent/20 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-warm-accent" />
          <h3 className="text-h4 font-bold text-deep-navy">Чеклист лабораторных анализов</h3>
        </div>
        <p className="text-body text-deep-navy/70 mb-6">
          Скачайте бесплатный чеклист важных лабораторных анализов для женщин в период менопаузы. 
          Он поможет вам подготовиться к визиту к врачу и обсудить необходимые обследования.
        </p>
        <DownloadLabChecklistButton label="Скачать чеклист анализов" />
      </motion.div>

      {/* Save to Collection Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <SaveToCollectionButton
          contentType="quiz"
          contentId="frax"
          title="Оценка риска переломов (FRAX)"
          description={`Ваш уровень риска: ${getRiskLabel()}. ${result.hip_fracture_risk_10y}% риск перелома бедра, ${result.major_osteoporotic_fracture_risk_10y}% риск основных остеопоротических переломов.`}
          url="/quiz/frax"
          metadata={{
            risk_level: result.risk_level,
            hip_fracture_risk: result.hip_fracture_risk_10y,
            major_fracture_risk: result.major_osteoporotic_fracture_risk_10y,
          }}
        />
      </motion.div>

      <div className="flex gap-4">
        <Link
          href="/quiz"
          className="flex-1 px-6 py-3 bg-lavender-bg hover:bg-lavender-bg/80 rounded-full text-center font-medium text-deep-navy transition-colors"
        >
          Вернуться к квизам
        </Link>
        <Link
          href="/knowledge-base/symptoms/kosti-sustavy"
          className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-purple to-warm-accent text-white rounded-full text-center font-medium hover:shadow-button-hover transition-all"
        >
          Узнать больше о здоровье костей
        </Link>
      </div>
    </div>
  )
}

