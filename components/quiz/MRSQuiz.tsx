'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { MRSResults } from './MRSResults'

interface MRSQuestion {
  id: number
  category: string
  question: string
  description?: string
}

const MRS_QUESTIONS: MRSQuestion[] = [
  {
    id: 1,
    category: 'Вазомоторные симптомы',
    question: 'Приливы (внезапные волны жара)',
    description: 'Оцените, насколько часто и интенсивно вы испытываете приливы',
  },
  {
    id: 2,
    category: 'Вазомоторные симптомы',
    question: 'Ночная потливость',
    description: 'Просыпаетесь ли вы ночью из-за потливости?',
  },
  {
    id: 3,
    category: 'Психоэмоциональные симптомы',
    question: 'Нарушения сна',
    description: 'Трудно ли вам заснуть или вы часто просыпаетесь?',
  },
  {
    id: 4,
    category: 'Психоэмоциональные симптомы',
    question: 'Депрессивное настроение',
    description: 'Чувствуете ли вы грусть, подавленность или потерю интереса?',
  },
  {
    id: 5,
    category: 'Психоэмоциональные симптомы',
    question: 'Раздражительность',
    description: 'Легко ли вас вывести из себя?',
  },
  {
    id: 6,
    category: 'Психоэмоциональные симптомы',
    question: 'Тревожность',
    description: 'Испытываете ли вы беспокойство, волнение или страх?',
  },
  {
    id: 7,
    category: 'Психоэмоциональные симптомы',
    question: 'Физическая и умственная усталость',
    description: 'Чувствуете ли вы постоянную усталость, даже после отдыха?',
  },
  {
    id: 8,
    category: 'Урогенитальные симптомы',
    question: 'Проблемы с мочевым пузырём',
    description: 'Частые позывы, недержание или дискомфорт при мочеиспускании?',
  },
  {
    id: 9,
    category: 'Урогенитальные симптомы',
    question: 'Сухость влагалища',
    description: 'Ощущаете ли вы сухость, зуд или дискомфорт во влагалище?',
  },
  {
    id: 10,
    category: 'Сексуальные проблемы',
    question: 'Снижение интереса к сексу',
    description: 'Изменился ли ваш интерес к интимной близости?',
  },
  {
    id: 11,
    category: 'Другие симптомы',
    question: 'Боли в суставах и мышцах',
    description: 'Испытываете ли вы боли в суставах, мышцах или костях?',
  },
]

const SCORE_LABELS = [
  { value: 0, label: 'Нет симптомов' },
  { value: 1, label: 'Лёгкие симптомы' },
  { value: 2, label: 'Умеренные симптомы' },
  { value: 3, label: 'Выраженные симптомы' },
  { value: 4, label: 'Очень выраженные симптомы' },
]

interface MRSQuizProps {
  onComplete?: (results: MRSResults) => void
}

export interface MRSResults {
  totalScore: number
  vasomotorScore: number
  psychologicalScore: number
  urogenitalScore: number
  somaticScore: number
  severity: 'mild' | 'moderate' | 'severe'
  recommendations: string[]
  answers: Array<{ questionId: number; score: number }>
}

export const MRSQuiz: FC<MRSQuizProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<MRSResults | null>(null)

  const handleAnswer = (score: number) => {
    const newAnswers = { ...answers, [MRS_QUESTIONS[currentQuestion].id]: score }
    setAnswers(newAnswers)

    // Переход к следующему вопросу
    if (currentQuestion < MRS_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 300)
    } else {
      // Все вопросы отвечены, вычисляем результаты
      calculateResults(newAnswers)
    }
  }

  const calculateResults = (allAnswers: Record<number, number>) => {
    // Группируем вопросы по категориям
    const vasomotorQuestions = [1, 2] // Приливы, ночная потливость
    const psychologicalQuestions = [3, 4, 5, 6, 7] // Сон, депрессия, раздражительность, тревога, усталость
    const urogenitalQuestions = [8, 9] // Мочевой пузырь, сухость влагалища
    const somaticQuestions = [10, 11] // Сексуальные проблемы, боли

    const vasomotorScore = vasomotorQuestions.reduce((sum, id) => sum + (allAnswers[id] || 0), 0)
    const psychologicalScore = psychologicalQuestions.reduce((sum, id) => sum + (allAnswers[id] || 0), 0)
    const urogenitalScore = urogenitalQuestions.reduce((sum, id) => sum + (allAnswers[id] || 0), 0)
    const somaticScore = somaticQuestions.reduce((sum, id) => sum + (allAnswers[id] || 0), 0)

    const totalScore = vasomotorScore + psychologicalScore + urogenitalScore + somaticScore

    // Определяем степень тяжести
    let severity: 'mild' | 'moderate' | 'severe'
    if (totalScore <= 16) {
      severity = 'mild'
    } else if (totalScore <= 27) {
      severity = 'moderate'
    } else {
      severity = 'severe'
    }

    // Генерируем рекомендации
    const recommendations = generateRecommendations(totalScore, severity, {
      vasomotorScore,
      psychologicalScore,
      urogenitalScore,
      somaticScore,
    })

    const resultsData: MRSResults = {
      totalScore,
      vasomotorScore,
      psychologicalScore,
      urogenitalScore,
      somaticScore,
      severity,
      recommendations,
      answers: Object.entries(allAnswers).map(([questionId, score]) => ({
        questionId: parseInt(questionId),
        score,
      })),
    }

    setResults(resultsData)
    setShowResults(true)
    if (onComplete) {
      onComplete(resultsData)
    }
  }

  const generateRecommendations = (
    totalScore: number,
    severity: 'mild' | 'moderate' | 'severe',
    categoryScores: {
      vasomotorScore: number
      psychologicalScore: number
      urogenitalScore: number
      somaticScore: number
    }
  ): string[] => {
    const recommendations: string[] = []

    if (severity === 'mild') {
      recommendations.push('Ваши симптомы выражены слабо. Немедикаментозные методы (изменение образа жизни, дыхательные техники) могут быть достаточными.')
    } else if (severity === 'moderate') {
      recommendations.push('Ваши симптомы выражены умеренно. Рекомендуется обсудить с врачом возможность ЗГТ или других методов лечения.')
    } else {
      recommendations.push('Ваши симптомы выражены сильно. Настоятельно рекомендуется обратиться к врачу для обсуждения лечения, включая ЗГТ.')
    }

    if (categoryScores.vasomotorScore >= 4) {
      recommendations.push('Вазомоторные симптомы (приливы, ночная потливость) выражены. ЗГТ может быть особенно эффективна для их облегчения.')
    }

    if (categoryScores.psychologicalScore >= 8) {
      recommendations.push('Психоэмоциональные симптомы выражены. Помимо ЗГТ, может быть полезна когнитивно-поведенческая терапия (КПТ).')
    }

    if (categoryScores.urogenitalScore >= 4) {
      recommendations.push('Урогенитальные симптомы выражены. Рассмотрите местную терапию эстрогенами или системную ЗГТ.')
    }

    if (categoryScores.somaticScore >= 4) {
      recommendations.push('Соматические симптомы выражены. Обсудите с врачом комплексный подход к лечению.')
    }

    return recommendations
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const progress = ((currentQuestion + 1) / MRS_QUESTIONS.length) * 100
  const currentQ = MRS_QUESTIONS[currentQuestion]

  if (showResults && results) {
    return <MRSResults results={results} />
  }

  return (
    <div className="min-h-screen bg-soft-white flex items-center justify-center py-12 md:py-16">
      <div className="w-full max-w-3xl mx-auto px-4 md:px-6">
        {/* Decorative Logo Element - Top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-10 md:mb-12"
        >
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <Image
              src="/logo.png"
              alt="Без |Паузы"
              fill
              className="object-contain opacity-10"
              priority
            />
          </div>
        </motion.div>

        {/* Main Quiz Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 lg:p-16 shadow-2xl"
          >
            {/* Progress Bar - Minimal */}
            <div className="mb-10 md:mb-12">
              <div className="w-full h-1 bg-lavender-bg rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-purple to-ocean-wave-start"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs md:text-sm text-deep-navy/50 font-medium">
                  {currentQuestion + 1} / {MRS_QUESTIONS.length}
                </span>
                <span className="text-xs md:text-sm text-deep-navy/50 font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Category - Subtle */}
            <div className="mb-8 md:mb-10 text-center">
              <span className="inline-block px-4 py-1.5 bg-primary-purple/5 text-primary-purple rounded-full text-xs font-semibold uppercase tracking-wider">
                {currentQ.category}
              </span>
            </div>

            {/* Question - Large and Centered */}
            <div className="mb-12 md:mb-16">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-deep-navy text-center leading-tight mb-6 md:mb-8 px-4">
                {currentQ.question}
              </h1>
              {currentQ.description && (
                <p className="text-lg md:text-xl text-deep-navy/60 text-center max-w-2xl mx-auto leading-relaxed">
                  {currentQ.description}
                </p>
              )}
            </div>

            {/* Answer Options - Clean and Simple */}
            <div className="space-y-3 md:space-y-4 mb-12 md:mb-16 max-w-xl mx-auto">
              {SCORE_LABELS.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-5 md:p-6 rounded-2xl border-2 transition-all duration-200 text-center ${
                    answers[currentQ.id] === option.value
                      ? 'border-primary-purple bg-primary-purple/5 shadow-lg'
                      : 'border-deep-navy/20 bg-white hover:border-primary-purple/40 hover:bg-lavender-bg/30'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    {answers[currentQ.id] === option.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-primary-purple flex items-center justify-center flex-shrink-0"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                    <span className={`text-base md:text-lg font-semibold ${
                      answers[currentQ.id] === option.value
                        ? 'text-deep-navy'
                        : 'text-deep-navy/80'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Navigation - Bottom */}
            <div className="flex justify-between items-center pt-6 border-t border-lavender-bg">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm md:text-base transition-all ${
                  currentQuestion === 0
                    ? 'opacity-30 cursor-not-allowed text-deep-navy/40'
                    : 'text-deep-navy hover:text-primary-purple hover:bg-lavender-bg'
                }`}
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Назад</span>
              </button>
              <div className="text-xs md:text-sm text-deep-navy/50 font-medium">
                {Object.keys(answers).length} из {MRS_QUESTIONS.length}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
