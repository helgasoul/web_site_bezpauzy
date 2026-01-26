'use client'

import { FC, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Moon, TrendingUp, Heart, Brain, Activity, AlertCircle, CheckCircle2 } from 'lucide-react'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

interface SleepTopicModalProps {
  isOpen: boolean
  onClose: () => void
  topicSlug?: string
  categorySlug?: string
}

export const SleepTopicModal: FC<SleepTopicModalProps> = ({ isOpen, onClose, topicSlug = 'son', categorySlug = 'symptoms' }) => {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-soft-white rounded-card shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-purple to-ocean-wave-start p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-grow">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center flex-shrink-0">
                      <Moon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-h3 font-bold mb-2">Сон и менопауза</h2>
                      <p className="text-white/90 text-body">
                        Научно обоснованная информация о нарушениях сна
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors flex items-center justify-center flex-shrink-0"
                    aria-label="Закрыть"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto flex-grow p-6 md:p-8 space-y-8">
                {/* Статистика */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-purple" />
                    Статистика
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-primary-purple mb-1">40-60%</div>
                      <div className="text-body-small text-deep-navy/70">
                        женщин испытывают проблемы со сном
                      </div>
                    </div>
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-ocean-wave-start mb-1">16-47%</div>
                      <div className="text-body-small text-deep-navy/70">
                        в перименопаузе
                      </div>
                    </div>
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-warm-accent mb-1">35-60%</div>
                      <div className="text-body-small text-deep-navy/70">
                        в постменопаузе
                      </div>
                    </div>
                  </div>
                </section>

                {/* Основные причины */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary-purple" />
                    Основные причины
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Приливы и ночная потливость',
                        description: 'Частые ночные пробуждения из-за вазомоторных симптомов',
                        icon: Activity,
                        gradient: 'from-primary-purple to-ocean-wave-start',
                      },
                      {
                        title: 'Гормональные изменения',
                        description: 'Снижение эстрогена и прогестерона нарушает регуляцию сна',
                        icon: Heart,
                        gradient: 'from-ocean-wave-start to-warm-accent',
                      },
                      {
                        title: 'Депрессия и тревога',
                        description: 'Риск нарушений сна увеличивается в 2.73 раза при депрессии',
                        icon: Brain,
                        gradient: 'from-warm-accent to-primary-purple',
                      },
                      {
                        title: 'Синдром обструктивного апноэ',
                        description: 'Распространенность 16-20% у женщин в менопаузе',
                        icon: Moon,
                        gradient: 'from-primary-purple to-ocean-wave-start',
                      },
                    ].map((item, index) => {
                      const Icon = item.icon
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 bg-soft-white border border-lavender-bg rounded-card hover:shadow-card transition-shadow"
                        >
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-grow">
                            <div className="font-semibold text-deep-navy mb-1">{item.title}</div>
                            <div className="text-body-small text-deep-navy/70">{item.description}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>

                {/* Методы лечения */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary-purple" />
                    Эффективные методы лечения
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'КПТ-И (CBT-I)',
                        description: 'Когнитивно-поведенческая терапия бессонницы — золотой стандарт первого выбора. Эффективность сохраняется до 6 месяцев после лечения.',
                        highlight: 'Рекомендуется NICE 2024',
                        color: 'primary-purple',
                      },
                      {
                        title: 'Заместительная гормональная терапия',
                        description: 'Наиболее эффективна при нарушениях сна, связанных с приливами. Трансдермальный эстроген снижает время засыпания и количество пробуждений.',
                        highlight: 'Эффективна при приливах',
                        color: 'ocean-wave-start',
                      },
                      {
                        title: 'Микронизированный прогестерон',
                        description: 'Улучшает время засыпания на 7.10 минут. Идеален для женщин с трудностями засыпания.',
                        highlight: 'Для трудностей засыпания',
                        color: 'warm-accent',
                      },
                      {
                        title: 'Габапентин',
                        description: 'Эффективная негормональная альтернатива при противопоказаниях к ЗГТ. Показал превосходство над плацебо.',
                        highlight: 'Альтернатива ЗГТ',
                        color: 'primary-purple',
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-lavender-bg/50 border border-lavender-bg rounded-card"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className={`font-semibold text-h6 ${
                            item.color === 'primary-purple' ? 'text-primary-purple' :
                            item.color === 'ocean-wave-start' ? 'text-ocean-wave-start' :
                            'text-warm-accent'
                          }`}>
                            {item.title}
                          </div>
                          <span className="text-xs font-medium text-deep-navy/60 bg-white px-2 py-1 rounded-full whitespace-nowrap">
                            {item.highlight}
                          </span>
                        </div>
                        <p className="text-body-small text-deep-navy/70">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Ключевой вывод */}
                <section className="bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10 rounded-card p-6 border border-primary-purple/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-purple/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary-purple" />
                    </div>
                    <div>
                      <div className="font-semibold text-deep-navy mb-2">Главное</div>
                      <p className="text-body text-deep-navy/80">
                        Нарушения сна при менопаузе — это не норма, которую нужно терпеть. 
                        Существуют научно обоснованные методы лечения. Если проблемы со сном 
                        связаны с приливами, эффективна ЗГТ. Для хронической бессонницы 
                        первой линией лечения является КПТ-И.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Источники */}
                <section>
                  <h3 className="text-h6 font-semibold text-deep-navy mb-3">Источники информации</h3>
                  <div className="space-y-2 text-body-small text-deep-navy/70">
                    <p>• Menopausal Sleep Disruption: Evidence-Based Paths From Hormones to CBT</p>
                    <p>• NICE Guidelines 2024: Insomnia management</p>
                    <p>• EMAS position statements on menopause</p>
                  </div>
                </section>
              </div>

              {/* Disclaimer */}
              <div className="px-6 md:px-8 pb-4">
                <MedicalDisclaimer variant="full" />
              </div>

              {/* Footer */}
              <div className="border-t border-lavender-bg p-6 bg-soft-white">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-body-small text-deep-navy/60 text-center sm:text-left">
                    Хотите узнать больше? Перейдите на страницу темы для подробной информации.
                  </p>
                  <Link
                    href={`/knowledge-base/${categorySlug}/${topicSlug}`}
                    onClick={onClose}
                    className="px-6 py-2.5 bg-gradient-primary text-white rounded-full font-medium hover:shadow-button-hover transition-all text-center"
                  >
                    Узнать подробнее
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

