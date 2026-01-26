import type { Metadata } from 'next'
import { QuizCard } from '@/components/quiz/QuizCard'
import { QuizHero } from '@/components/quiz/QuizHero'

export const metadata: Metadata = {
  title: 'Квизы и тесты | Без |Паузы',
  description: 'Пройдите бесплатные квизы для оценки симптомов менопаузы, уровня воспаления и общего состояния здоровья. Получите персонализированные рекомендации.',
  keywords: ['квизы менопауза', 'тесты здоровье', 'оценка симптомов', 'менопауза тест', 'здоровье женщины'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/quiz`,
  },
  openGraph: {
    title: 'Квизы и тесты | Без |Паузы',
    description: 'Пройдите бесплатные квизы для оценки симптомов менопаузы и получения персонализированных рекомендаций',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/quiz`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

const quizzes = [
  {
    id: 'mrs',
    title: 'Menopause Rating Scale (MRS)',
    description: 'Оцените уровень тяжести симптомов менопаузы по международной шкале. Узнайте, насколько выражены приливы, проблемы со сном, настроением и другие симптомы.',
    category: 'Симптомы менопаузы',
    duration: '5-7 минут',
    questionsCount: 11,
    iconName: 'activity' as const,
    gradientFrom: 'from-primary-purple',
    gradientTo: 'to-ocean-wave-start',
    href: '/quiz/mrs',
  },
  {
    id: 'inflammation',
    title: 'Индекс воспаления',
    description: 'Узнайте уровень хронического воспаления в вашем организме. Персонализированные рекомендации по питанию и образу жизни для женщин в менопаузе.',
    category: 'Здоровье и питание',
    duration: '8-10 минут',
    questionsCount: 20,
    iconName: 'trending-up' as const,
    gradientFrom: 'from-ocean-wave-start',
    gradientTo: 'to-primary-purple',
    href: '/quiz/inflammation',
  },
  {
    id: 'frax',
    title: 'Оценка риска переломов (FRAX)',
    description: 'Оцените ваш 10-летний риск переломов на основе факторов риска остеопороза. Основано на международном инструменте FRAX®.',
    category: 'Здоровье костей',
    duration: '5-7 минут',
    questionsCount: 10,
    iconName: 'activity' as const,
    gradientFrom: 'from-primary-purple',
    gradientTo: 'to-warm-accent',
    href: '/quiz/frax',
  },
]

export default function QuizListPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      {/* Hero Section */}
      <QuizHero />

      {/* Quizzes Grid */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
            {quizzes.map((quiz, index) => (
              <QuizCard
                key={quiz.id}
                {...quiz}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-lavender-bg">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-h3 font-bold text-deep-navy mb-6">
              Остались вопросы?
            </h2>
            <p className="text-body text-deep-navy/70 mb-8">
              Ева — ваш AI-консультант по менопаузе — готова ответить на вопросы о симптомах, здоровье и образе жизни
            </p>
            <a href="/bot">
              <button className="px-8 py-4 rounded-pill font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2 bg-gradient-primary text-soft-white shadow-button hover:shadow-button-hover hover:-translate-y-0.5">
                Задать вопрос Еве
              </button>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
