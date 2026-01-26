'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ChevronDown,
} from 'lucide-react'

interface Chapter {
  number: number
  title: string
  description: string
  icon: FC<{ className?: string }>
  part: string
}

const chapters: Chapter[] = [
  // ЧАСТЬ I: ПРОБУЖДЕНИЕ ВИДЕНИЯ
  {
    number: 1,
    title: 'Невидимая революция',
    description: 'От страха неизвестного к пониманию процесса. Почему менопауза окружена тайной и страхом?',
    icon: Eye,
    part: 'I',
  },
  {
    number: 2,
    title: 'Анатомия трансформации',
    description: 'От "что-то сломалось" к "это эволюция". Эндокринная система как симфония.',
    icon: Atom,
    part: 'I',
  },
  // ЧАСТЬ II: ФИЗИКА СИМПТОМОВ
  {
    number: 3,
    title: 'Приливы — тепловые волны жизни',
    description: 'От "почему это происходит со мной" к "вот как это работает". Термостат мозга и его настройки.',
    icon: Flame,
    part: 'II',
  },
  {
    number: 4,
    title: 'Сон, мозг и туман',
    description: 'От "я теряю себя" к "мой мозг перенастраивается". Эстроген и нейропластичность.',
    icon: Brain,
    part: 'II',
  },
  {
    number: 5,
    title: 'Настроение — эмоциональная погода',
    description: 'От "я схожу с ума" к "это биохимия, не я". Серотонин, дофамин и гормональная связь.',
    icon: Heart,
    part: 'II',
  },
  {
    number: 6,
    title: 'Тело в трансформации',
    description: 'От "я не узнаю себя" к "я понимаю изменения". Метаболизм, кости, кожа, сексуальность.',
    icon: Activity,
    part: 'II',
  },
  // ЧАСТЬ III: НАВИГАЦИЯ ВАРИАНТОВ
  {
    number: 7,
    title: 'Гормональная терапия — физика и философия',
    description: 'От "это опасно" к "это инструмент, который я понимаю". ЗГТ как инструмент выбора.',
    icon: Pill,
    part: 'III',
  },
  {
    number: 8,
    title: 'Негормональные пути',
    description: 'От "только таблетки" к "множеству стратегий". Нутрицевтики, образ жизни, холистический подход.',
    icon: Leaf,
    part: 'III',
  },
  // ЧАСТЬ IV: ТРАНСФОРМАЦИЯ НАРРАТИВА
  {
    number: 9,
    title: 'Сексуальность после паузы',
    description: 'От "это конец" к "это новое начало". Физиология либидо в новой гормональной реальности.',
    icon: HeartHandshake,
    part: 'IV',
  },
  {
    number: 10,
    title: 'Долгосрочное здоровье — архитектура будущего',
    description: 'От "профилактика болезней" к "дизайну здоровья". Сердце, мозг, метаболизм, кости на десятилетия.',
    icon: Shield,
    part: 'IV',
  },
  {
    number: 11,
    title: 'Психология трансформации',
    description: 'От "кризис идентичности" к "реинвенции себя". Кто я после менопаузы?',
    icon: Sparkles,
    part: 'IV',
  },
  // ЧАСТЬ V: ИНТЕГРАЦИЯ
  {
    number: 12,
    title: 'Ваш индивидуальный путь',
    description: 'От "общих рекомендаций" к "моему уникальному протоколу". Практические инструменты для навигации.',
    icon: Compass,
    part: 'V',
  },
]

const parts = [
  { id: 'I', title: 'Пробуждение видения', subtitle: '"Глаз не может увидеть то, чего мозг не знает"' },
  { id: 'II', title: 'Физика симптомов', subtitle: '"Понимание механизма освобождает от страха"' },
  { id: 'III', title: 'Навигация вариантов', subtitle: '"Знание путей дает свободу выбора"' },
  { id: 'IV', title: 'Трансформация нарратива', subtitle: '"От выживания к процветанию"' },
  { id: 'V', title: 'Интеграция', subtitle: '"Новое видение себя"' },
]

interface BookTableOfContentsProps {}

export const BookTableOfContents: FC<BookTableOfContentsProps> = () => {
  const [openPartId, setOpenPartId] = useState<string | null>(null)

  const chaptersByPart = parts.map((part) => ({
    ...part,
    chapters: chapters.filter((ch) => ch.part === part.id),
  }))

  const togglePart = (partId: string) => {
    setOpenPartId(openPartId === partId ? null : partId)
  }

  return (
    <section className="py-16 md:py-24 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-h2 md:text-h1 font-bold text-deep-navy mb-4">
            О чем книга?
          </h2>
          <p className="text-body-large text-deep-navy/70 max-w-2xl mx-auto">
            12 глав в 5 частях — путешествие от страха к пониманию, от незнания к знанию, от страдания к трансформации
          </p>
        </motion.div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {chaptersByPart.map((part, partIndex) => {
            const isOpen = openPartId === part.id
            return (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: partIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-card overflow-hidden border border-lavender-bg hover:shadow-card-hover transition-all duration-300"
              >
                {/* Part Header - Clickable */}
                <button
                  onClick={() => togglePart(part.id)}
                  className="w-full px-6 md:px-8 py-6 md:py-8 text-left flex items-center justify-between hover:bg-lavender-bg/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-purple/20 focus:ring-offset-2 rounded-2xl"
                  aria-expanded={isOpen}
                  aria-controls={`part-${part.id}-chapters`}
                >
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-purple/10 rounded-full mb-4">
                      <span className="text-body-small font-semibold text-primary-purple">
                        ЧАСТЬ {part.id}
                      </span>
                    </div>
                    <h3 className="text-h3 font-bold text-deep-navy mb-2">
                      {part.title}
                    </h3>
                    <p className="text-body text-deep-navy/70 italic">
                      {part.subtitle}
                    </p>
                    <p className="text-body-small text-deep-navy/60 mt-2">
                      {part.chapters.length} {part.chapters.length === 1 ? 'глава' : 'глав'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <ChevronDown
                      className={`w-6 h-6 text-primary-purple transition-transform duration-300 ${
                        isOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Chapters Grid - Accordion Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`part-${part.id}-chapters`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                          {part.chapters.map((chapter, chapterIndex) => {
                            const Icon = chapter.icon
                            return (
                              <motion.div
                                key={chapter.number}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: chapterIndex * 0.1 }}
                                className="bg-lavender-bg rounded-2xl p-6 md:p-8 border border-primary-purple/10 hover:border-primary-purple/30 transition-all duration-300"
                              >
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-primary-purple/20 to-ocean-wave-start/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-6 h-6 text-primary-purple" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-body-small font-semibold text-primary-purple">
                                        Глава {chapter.number}
                                      </span>
                                    </div>
                                    <h4 className="text-h4 font-semibold text-deep-navy mb-2">
                                      {chapter.title}
                                    </h4>
                                    <p className="text-body text-deep-navy/70 leading-relaxed">
                                      {chapter.description}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Epilogue */}
        <motion.div
          className="mt-16 text-center bg-gradient-to-br from-lavender-bg to-soft-white rounded-3xl p-8 md:p-12 border border-primary-purple/20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Sparkles className="w-12 h-12 text-primary-purple mx-auto mb-4" />
          <h3 className="text-h3 font-bold text-deep-navy mb-3">
            Эпилог: Я вижу глубже
          </h3>
          <p className="text-body-large text-deep-navy/80 max-w-2xl mx-auto">
            От страха к пониманию: путь пройден. Менопауза как портал, не закрытие. Приглашение в новую эру жизни.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

