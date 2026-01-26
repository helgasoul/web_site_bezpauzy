'use client'

import { FC, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Heart, TrendingUp, AlertTriangle, Brain, Activity, CheckCircle2, Users, Zap } from 'lucide-react'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

interface MoodTopicModalProps {
  isOpen: boolean
  onClose: () => void
  topicSlug?: string
  categorySlug?: string
}

export const MoodTopicModal: FC<MoodTopicModalProps> = ({ isOpen, onClose, topicSlug = 'nastroenie', categorySlug = 'symptoms' }) => {
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
              <div className="bg-gradient-to-r from-warm-accent to-primary-purple p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-grow">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-h3 font-bold mb-2">Настроение и менопауза</h2>
                      <p className="text-white/90 text-body">
                        Научно обоснованная информация о расстройствах настроения
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
                    <TrendingUp className="w-5 h-5 text-warm-accent" />
                    Статистика
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-warm-accent mb-1">35.6%</div>
                      <div className="text-body-small text-deep-navy/70">
                        женщин испытывают депрессию в период менопаузы
                      </div>
                    </div>
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-primary-purple mb-1">2-4×</div>
                      <div className="text-body-small text-deep-navy/70">
                        выше риск депрессивного эпизода в перименопаузе
                      </div>
                    </div>
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-ocean-wave-start mb-1">52%</div>
                      <div className="text-body-small text-deep-navy/70">
                        увеличение частоты психических расстройств в перименопаузе
                      </div>
                    </div>
                  </div>
                </section>

                {/* Основные причины */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warm-accent" />
                    Основные причины
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Гормональная волатильность',
                        description: 'Нестабильные колебания эстрадиола нарушают баланс серотонина, дофамина и GABA в мозге',
                        icon: Zap,
                        gradient: 'from-warm-accent to-primary-purple',
                      },
                      {
                        title: 'Приливы и нарушение сна',
                        description: 'Вазомоторные симптомы и плохой сон — ключевые медиаторы депрессии. До 60% женщин страдают от нарушений сна',
                        icon: Activity,
                        gradient: 'from-primary-purple to-ocean-wave-start',
                      },
                      {
                        title: 'Нарушение работы нейротрансмиттеров',
                        description: 'Снижение эстрогена уменьшает активность серотонина, нарушает работу дофаминовой системы и GABA',
                        icon: Brain,
                        gradient: 'from-ocean-wave-start to-warm-accent',
                      },
                      {
                        title: 'Стресс и нейровоспаление',
                        description: 'Дисрегуляция HPA-оси (система стресса) и потеря противовоспалительного действия эстрогена',
                        icon: Heart,
                        gradient: 'from-warm-accent to-primary-purple',
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

                {/* Факторы риска */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-warm-accent" />
                    Факторы риска
                  </h3>
                  <div className="bg-lavender-bg/50 rounded-card p-6 border border-lavender-bg">
                    <div className="space-y-4">
                      {[
                        {
                          factor: 'Предыдущая депрессия',
                          risk: 'Высокий (70% выше риск рецидива)',
                          icon: AlertTriangle,
                        },
                        {
                          factor: 'Хирургическая менопауза',
                          risk: 'Высокий (резкое снижение гормонов)',
                          icon: AlertTriangle,
                        },
                        {
                          factor: 'Умеренные и тяжелые приливы',
                          risk: 'Высокий (опосредованно через сон)',
                          icon: Activity,
                        },
                        {
                          factor: 'Психоактивные препараты',
                          risk: 'Умеренный (OR 3.19)',
                          icon: Brain,
                        },
                        {
                          factor: 'Психосоциальные стрессоры',
                          risk: 'Умеренный (ACEs, низкий СЭС, негативные события)',
                          icon: Heart,
                        },
                      ].map((item, index) => {
                        const Icon = item.icon
                        return (
                          <div key={index} className="flex items-start gap-3">
                            <Icon className="w-5 h-5 text-warm-accent flex-shrink-0 mt-0.5" />
                            <div className="flex-grow">
                              <span className="font-semibold text-deep-navy">{item.factor}:</span>
                              <span className="text-body text-deep-navy/80 ml-2">{item.risk}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>

                {/* Методы лечения */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-warm-accent" />
                    Эффективные методы лечения
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'КПТ-Мено (CBT-Meno)',
                        description: 'Менопауза-специфическая когнитивно-поведенческая терапия. Рекомендуется NICE 2024. Улучшает настроение, сон и уменьшает приливы.',
                        highlight: 'Рекомендуется NICE 2024',
                        color: 'warm-accent',
                      },
                      {
                        title: 'Заместительная гормональная терапия',
                        description: 'Наиболее эффективна при нарушениях, связанных с приливами. Улучшает настроение как вторичный эффект. Важен выбор прогестерона — микронизированный предпочтительнее для чувствительных женщин.',
                        highlight: 'При приливах',
                        color: 'primary-purple',
                      },
                      {
                        title: 'SSRIs/SNRIs',
                        description: 'Первая линия при диагностированной депрессии или тревоге. SNRIs (венлафаксин, десвенлафаксин) также эффективны при приливах. Важно учитывать взаимодействие с тамоксифеном.',
                        highlight: 'При депрессии',
                        color: 'ocean-wave-start',
                      },
                      {
                        title: 'Микро-интервенции',
                        description: 'Внимательность (MBIs) наиболее эффективна для улучшения сна. Физические упражнения уменьшают депрессивные симптомы. Акупунктура и гипноз эффективны при приливах.',
                        highlight: 'Дополнительно',
                        color: 'warm-accent',
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-lavender-bg/50 border border-lavender-bg rounded-card"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className={`font-semibold text-h6 ${
                            item.color === 'warm-accent' ? 'text-warm-accent' :
                            item.color === 'primary-purple' ? 'text-primary-purple' :
                            'text-ocean-wave-start'
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

                {/* Важная информация */}
                <section className="bg-gradient-to-r from-warm-accent/10 to-primary-purple/10 rounded-card p-6 border border-warm-accent/20">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-warm-accent/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-warm-accent" />
                      </div>
                      <div>
                        <div className="font-semibold text-deep-navy mb-2">Особые случаи</div>
                        <div className="space-y-2 text-body text-deep-navy/80">
                          <p>
                            <strong>При тамоксифене:</strong> избегайте пароксетина и флуоксетина. 
                            Используйте венлафаксин, десвенлафаксин, эсциталопрам или циталопрам.
                          </p>
                          <p>
                            <strong>При биполярном расстройстве:</strong> антидепрессанты могут 
                            вызывать манию. Требуется консультация психиатра для оптимизации 
                            настроения стабилизаторов.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Ключевой вывод */}
                <section className="bg-gradient-to-r from-primary-purple/10 to-warm-accent/10 rounded-card p-6 border border-primary-purple/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-purple/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary-purple" />
                    </div>
                    <div>
                      <div className="font-semibold text-deep-navy mb-2">Главное</div>
                      <p className="text-body text-deep-navy/80">
                        Перименопауза — период повышенного риска расстройств настроения. 
                        Лечение должно быть комплексным и индивидуальным. Если проблемы 
                        связаны с приливами и сном, начните с их лечения. При клинической 
                        депрессии первой линией являются антидепрессанты. КПТ-Мено — 
                        эффективная нелекарственная альтернатива или дополнение.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Источники */}
                <section>
                  <h3 className="text-h6 font-semibold text-deep-navy mb-3">Источники информации</h3>
                  <div className="space-y-2 text-body-small text-deep-navy/70">
                    <p>• Closing the Vulnerability Window: Evidence-Based Mood Disorder Management in Peri- & Post-Menopause</p>
                    <p>• EMAS position statements on mood disorders in menopause</p>
                    <p>• International Menopause Society guidelines</p>
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
                    className="px-6 py-2.5 bg-gradient-to-r from-warm-accent to-primary-purple text-white rounded-full font-medium hover:shadow-button-hover transition-all text-center"
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

