'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import {
  Eye,
  Atom,
  Flame,
  Brain,
  Heart,
  Activity,
  Pill,
  Leaf,
  HeartHandshake,
  Shield,
  Sparkles,
  Compass,
  BookOpen,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

interface Chapter {
  number: number
  title: string
  description: string
  icon: FC<{ className?: string }>
  part: string
  keyTopics?: string[]
  pages?: string
}

const chapters: Chapter[] = [
  // ЧАСТЬ I: ПРОБУЖДЕНИЕ ВИДЕНИЯ
  {
    number: 1,
    title: 'Невидимая революция',
    description: 'От страха неизвестного к пониманию процесса. Почему менопауза окружена тайной и страхом?',
    icon: Eye,
    part: 'I',
    keyTopics: [
      'Исторический контекст менопаузы',
      'Культурные мифы и стереотипы',
      'Почему менопауза стала табу',
      'Научный подход к пониманию',
    ],
    pages: '15-35',
  },
  {
    number: 2,
    title: 'Анатомия трансформации',
    description: 'От "что-то сломалось" к "это эволюция". Эндокринная система как симфония.',
    icon: Atom,
    part: 'I',
    keyTopics: [
      'Гормональная система до и после',
      'Роль эстрогена, прогестерона, тестостерона',
      'Гипоталамо-гипофизарная ось',
      'Физиология трансформации',
    ],
    pages: '36-58',
  },
  // ЧАСТЬ II: ФИЗИКА СИМПТОМОВ
  {
    number: 3,
    title: 'Приливы — тепловые волны жизни',
    description: 'От "почему это происходит со мной" к "вот как это работает". Термостат мозга и его настройки.',
    icon: Flame,
    part: 'II',
    keyTopics: [
      'Механизм возникновения приливов',
      'Терморегуляция и гипоталамус',
      'Триггеры и факторы влияния',
      'Стратегии облегчения',
    ],
    pages: '59-85',
  },
  {
    number: 4,
    title: 'Сон, мозг и туман',
    description: 'От "я теряю себя" к "мой мозг перенастраивается". Эстроген и нейропластичность.',
    icon: Brain,
    part: 'II',
    keyTopics: [
      'Влияние эстрогена на когнитивные функции',
      'Менопаузальный туман',
      'Нарушения сна и их причины',
      'Нейропластичность и адаптация',
    ],
    pages: '86-110',
  },
  {
    number: 5,
    title: 'Настроение — эмоциональная погода',
    description: 'От "я схожу с ума" к "это биохимия, не я". Серотонин, дофамин и гормональная связь.',
    icon: Heart,
    part: 'II',
    keyTopics: [
      'Гормоны и нейромедиаторы',
      'Депрессия и тревога в менопаузе',
      'Эмоциональная лабильность',
      'Психологические аспекты',
    ],
    pages: '111-135',
  },
  {
    number: 6,
    title: 'Тело в трансформации',
    description: 'От "я не узнаю себя" к "я понимаю изменения". Метаболизм, кости, кожа, сексуальность.',
    icon: Activity,
    part: 'II',
    keyTopics: [
      'Метаболические изменения',
      'Набор веса и его причины',
      'Изменения кожи и волос',
      'Костная система и остеопороз',
    ],
    pages: '136-165',
  },
  // ЧАСТЬ III: НАВИГАЦИЯ ВАРИАНТОВ
  {
    number: 7,
    title: 'Гормональная терапия — физика и философия',
    description: 'От "это опасно" к "это инструмент, который я понимаю". ЗГТ как инструмент выбора.',
    icon: Pill,
    part: 'III',
    keyTopics: [
      'Виды ЗГТ и их применение',
      'Показания и противопоказания',
      'Риски и преимущества',
      'Индивидуальный подход',
    ],
    pages: '166-195',
  },
  {
    number: 8,
    title: 'Негормональные пути',
    description: 'От "только таблетки" к "множеству стратегий". Нутрицевтики, образ жизни, холистический подход.',
    icon: Leaf,
    part: 'III',
    keyTopics: [
      'Фитоэстрогены и добавки',
      'Питание и менопауза',
      'Физическая активность',
      'Альтернативные методы',
    ],
    pages: '196-220',
  },
  // ЧАСТЬ IV: ТРАНСФОРМАЦИЯ НАРРАТИВА
  {
    number: 9,
    title: 'Сексуальность после паузы',
    description: 'От "это конец" к "это новое начало". Физиология либидо в новой гормональной реальности.',
    icon: HeartHandshake,
    part: 'IV',
    keyTopics: [
      'Физиология либидо',
      'Сухость влагалища',
      'Отношения и коммуникация',
      'Новые возможности',
    ],
    pages: '221-245',
  },
  {
    number: 10,
    title: 'Долгосрочное здоровье — архитектура будущего',
    description: 'От "профилактика болезней" к "дизайну здоровья". Сердце, мозг, метаболизм, кости на десятилетия.',
    icon: Shield,
    part: 'IV',
    keyTopics: [
      'Сердечно-сосудистое здоровье',
      'Когнитивное здоровье',
      'Метаболический синдром',
      'Профилактика остеопороза',
    ],
    pages: '246-265',
  },
  {
    number: 11,
    title: 'Психология трансформации',
    description: 'От "кризис идентичности" к "реинвенции себя". Кто я после менопаузы?',
    icon: Sparkles,
    part: 'IV',
    keyTopics: [
      'Идентичность и самооценка',
      'Кризис среднего возраста',
      'Новые роли и возможности',
      'Принятие изменений',
    ],
    pages: '266-280',
  },
  // ЧАСТЬ V: ИНТЕГРАЦИЯ
  {
    number: 12,
    title: 'Ваш индивидуальный путь',
    description: 'От "общих рекомендаций" к "моему уникальному протоколу". Практические инструменты для навигации.',
    icon: Compass,
    part: 'V',
    keyTopics: [
      'Создание индивидуального плана',
      'Работа с врачами',
      'Мониторинг и адаптация',
      'Практические инструменты',
    ],
    pages: '281-295',
  },
]

const parts = [
  { id: 'I', title: 'Пробуждение видения', subtitle: '"Глаз не может увидеть то, чего мозг не знает"' },
  { id: 'II', title: 'Физика симптомов', subtitle: '"Понимание механизма освобождает от страха"' },
  { id: 'III', title: 'Навигация вариантов', subtitle: '"Знание путей дает свободу выбора"' },
  { id: 'IV', title: 'Трансформация нарратива', subtitle: '"От выживания к процветанию"' },
  { id: 'V', title: 'Интеграция', subtitle: '"Новое видение себя"' },
]

export const BookChaptersPage: FC = () => {
  const chaptersByPart = parts.map((part) => ({
    ...part,
    chapters: chapters.filter((ch) => ch.part === part.id),
  }))

  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Книга', href: '/book' },
    { label: 'Оглавление', href: '/book/chapters' },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary-purple to-ocean-wave-start overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/90 to-ocean-wave-start/90" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} className="mb-8" />
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-body-small font-semibold text-white">Детальное оглавление</span>
            </div>
            <h1 className="text-h1 md:text-display font-bold text-white mb-6 drop-shadow-lg">
              Оглавление книги
            </h1>
            <p className="text-body-large text-white/95 mb-8 drop-shadow-md">
              12 глав в 5 частях — полное содержание книги &quot;Менопауза: Новое видение&quot;
            </p>
            <Link href="/book">
              <Button variant="ghost" className="bg-white text-primary-purple hover:bg-white/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к книге
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Chapters Content */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="space-y-12 max-w-5xl mx-auto">
            {chaptersByPart.map((part, partIndex) => (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: partIndex * 0.1 }}
                className="bg-white rounded-3xl shadow-card overflow-hidden border border-lavender-bg"
              >
                {/* Part Header */}
                <div className="bg-gradient-to-br from-primary-purple/10 to-ocean-wave-start/10 px-8 py-6 border-b border-lavender-bg">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-purple/20 rounded-full mb-4">
                    <span className="text-body-small font-semibold text-primary-purple">
                      ЧАСТЬ {part.id}
                    </span>
                  </div>
                  <h2 className="text-h2 font-bold text-deep-navy mb-2">
                    {part.title}
                  </h2>
                  <p className="text-body-large text-deep-navy/70 italic">
                    {part.subtitle}
                  </p>
                </div>

                {/* Chapters List */}
                <div className="p-8 space-y-6">
                  {part.chapters.map((chapter, chapterIndex) => {
                    const Icon = chapter.icon
                    return (
                      <motion.div
                        key={chapter.number}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: chapterIndex * 0.1 }}
                        className="border-l-4 border-primary-purple pl-6 py-4 hover:bg-lavender-bg/30 rounded-r-lg transition-colors"
                      >
                        <div className="flex items-start gap-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-purple/20 to-ocean-wave-start/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-primary-purple" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-body-small font-semibold text-primary-purple">
                                Глава {chapter.number}
                              </span>
                              {chapter.pages && (
                                <span className="text-body-small text-deep-navy/50">
                                  стр. {chapter.pages}
                                </span>
                              )}
                            </div>
                            <h3 className="text-h4 font-semibold text-deep-navy mb-2">
                              {chapter.title}
                            </h3>
                            <p className="text-body text-deep-navy/70 mb-4">
                              {chapter.description}
                            </p>
                            {chapter.keyTopics && chapter.keyTopics.length > 0 && (
                              <div className="mt-4">
                                <p className="text-body-small font-semibold text-deep-navy mb-2">
                                  Ключевые темы:
                                </p>
                                <ul className="space-y-1">
                                  {chapter.keyTopics.map((topic, index) => (
                                    <li key={index} className="text-body-small text-deep-navy/70 flex items-start gap-2">
                                      <span className="text-primary-purple mt-1">•</span>
                                      <span>{topic}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Epilogue */}
          <motion.div
            className="mt-16 text-center bg-gradient-to-br from-lavender-bg to-soft-white rounded-3xl p-8 md:p-12 border border-primary-purple/20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="w-12 h-12 text-primary-purple mx-auto mb-4" />
            <h3 className="text-h3 font-bold text-deep-navy mb-3">
              Эпилог: Я вижу глубже
            </h3>
            <p className="text-body-large text-deep-navy/80 max-w-2xl mx-auto mb-6">
              От страха к пониманию: путь пройден. Менопауза как портал, не закрытие. Приглашение в новую эру жизни.
            </p>
            <p className="text-body text-deep-navy/60">
              стр. 296-300
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/book">
              <Button variant="primary" className="px-8">
                Предзаказать книгу →
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}

