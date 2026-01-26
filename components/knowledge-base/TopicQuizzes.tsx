'use client'

import { FC } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Activity, TrendingUp, Calendar } from 'lucide-react'

interface Quiz {
  id: string
  title: string
  description: string
  href: string
  duration: string
  questionsCount: number
  icon: typeof Activity
  gradientFrom: string
  gradientTo: string
}

interface TopicQuizzesProps {
  quizIds?: string[]
}

// Данные квизов
const allQuizzes: Record<string, Quiz> = {
  mrs: {
    id: 'mrs',
    title: 'Menopause Rating Scale (MRS)',
    description: 'Оцените уровень тяжести симптомов менопаузы по международной шкале',
    href: '/quiz/mrs',
    duration: '5-7 минут',
    questionsCount: 11,
    icon: Activity,
    gradientFrom: 'from-primary-purple',
    gradientTo: 'to-ocean-wave-start',
  },
  inflammation: {
    id: 'inflammation',
    title: 'Индекс воспаления',
    description: 'Узнайте уровень хронического воспаления в вашем организме',
    href: '/quiz/inflammation',
    duration: '8-10 минут',
    questionsCount: 20,
    icon: TrendingUp,
    gradientFrom: 'from-ocean-wave-start',
    gradientTo: 'to-primary-purple',
  },
  phenoage: {
    id: 'phenoage',
    title: 'PhenoAge',
    description: 'Оцените свой биологический возраст',
    href: '/quiz/phenoage',
    duration: '10-12 минут',
    questionsCount: 25,
    icon: Calendar,
    gradientFrom: 'from-warm-accent',
    gradientTo: 'to-primary-purple',
  },
}

export const TopicQuizzes: FC<TopicQuizzesProps> = ({ quizIds = [] }) => {
  // Фильтруем квизы по ID
  const quizzes = quizIds
    .map(id => allQuizzes[id])
    .filter(Boolean)

  if (!quizzes || quizzes.length === 0) {
    return <></>
  }

  return (
    <section className="py-12 bg-lavender-bg">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-h3 font-bold text-deep-navy mb-2">Квизы и тесты</h2>
          <p className="text-body text-deep-navy/70">
            Пройдите тесты для оценки вашего состояния
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz, index) => {
            const Icon = quiz.icon
            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={quiz.href}
                  className="group block h-full"
                >
                  <div className="bg-soft-white rounded-card p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border border-lavender-bg">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${quiz.gradientFrom} ${quiz.gradientTo} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-h5 font-semibold text-deep-navy mb-2 group-hover:text-primary-purple transition-colors">
                      {quiz.title}
                    </h3>

                    {/* Description */}
                    <p className="text-body-small text-deep-navy/70 mb-4 flex-grow">
                      {quiz.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-body-small text-deep-navy/60 mb-4 pb-4 border-b border-lavender-bg">
                      <span>{quiz.duration}</span>
                      <span>•</span>
                      <span>{quiz.questionsCount} вопросов</span>
                    </div>

                    {/* Link */}
                    <div className="flex items-center gap-2 text-primary-purple group-hover:gap-3 transition-all">
                      <span className="text-body-small font-medium">Пройти квиз</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

