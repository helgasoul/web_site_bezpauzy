'use client'

import { FC, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Heart, TrendingUp, AlertTriangle, Activity, CheckCircle2, Users, Zap, Shield } from 'lucide-react'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

interface LibidoTopicModalProps {
  isOpen: boolean
  onClose: () => void
  topicSlug?: string
  categorySlug?: string
}

export const LibidoTopicModal: FC<LibidoTopicModalProps> = ({ isOpen, onClose, topicSlug = 'libido', categorySlug = 'symptoms' }) => {
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
                      <h2 className="text-h3 font-bold mb-2">Либидо и сексуальность при менопаузе</h2>
                      <p className="text-white/90 text-body">
                        Понимание изменений и пути к здоровой сексуальности
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
                    Почему это важно
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-warm-accent mb-1">40-60%</div>
                      <div className="text-body-small text-deep-navy/70">
                        женщин в менопаузе испытывают снижение либидо
                      </div>
                    </div>
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-primary-purple mb-1">50-70%</div>
                      <div className="text-body-small text-deep-navy/70">
                        женщин сообщают о проблемах с сексуальной функцией
                      </div>
                    </div>
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-ocean-wave-start mb-1">30-50%</div>
                      <div className="text-body-small text-deep-navy/70">
                        женщин испытывают сухость влагалища
                      </div>
                    </div>
                  </div>
                </section>

                {/* Основные причины */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warm-accent" />
                    Основные причины снижения либидо
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Гормональные изменения',
                        description: 'Снижение эстрогена и тестостерона влияет на либидо, секрецию, кровоток и чувствительность',
                        icon: Zap,
                        gradient: 'from-warm-accent to-primary-purple',
                      },
                      {
                        title: 'Сухость влагалища (атрофия)',
                        description: 'Снижение эстрогена приводит к истончению и сухости тканей влагалища, что вызывает боль и дискомфорт',
                        icon: Shield,
                        gradient: 'from-primary-purple to-ocean-wave-start',
                      },
                      {
                        title: 'Психологические факторы',
                        description: 'Изменения настроения, стресс, проблемы в отношениях, негативное отношение к своему телу',
                        icon: Heart,
                        gradient: 'from-ocean-wave-start to-warm-accent',
                      },
                      {
                        title: 'Физические факторы',
                        description: 'Усталость, проблемы со сном, боль в суставах, другие симптомы менопаузы',
                        icon: Activity,
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

                {/* Решения и лечение */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-warm-accent" />
                    Решения и лечение
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Заместительная гормональная терапия',
                        description: 'ЗГТ с эстрогеном эффективна при сухости влагалища и атрофии. Местные эстрогены (кремы, кольца) могут быть предпочтительны. Тестостерон может помочь при снижении либидо.',
                        highlight: 'Гормональное лечение',
                        color: 'warm-accent',
                      },
                      {
                        title: 'Лубриканты и увлажнители',
                        description: 'Регулярное использование лубрикантов во время секса и увлажнителей для ежедневного ухода помогают уменьшить дискомфорт и боль.',
                        highlight: 'Безрецептурные средства',
                        color: 'primary-purple',
                      },
                      {
                        title: 'Вагинальные эстрогены',
                        description: 'Местные формы эстрогена (кремы, таблетки, кольца) эффективны при атрофии влагалища с минимальным системным воздействием.',
                        highlight: 'Местное применение',
                        color: 'ocean-wave-start',
                      },
                      {
                        title: 'Психотерапия и консультирование',
                        description: 'Когнитивно-поведенческая терапия, секс-терапия и консультирование пар помогают решить психологические аспекты сексуальности.',
                        highlight: 'Психологическая поддержка',
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
                        <div className="font-semibold text-deep-navy mb-2">Важно помнить</div>
                        <div className="space-y-2 text-body text-deep-navy/80">
                          <p>
                            Снижение либидо в менопаузе — это нормально и распространено. 
                            Это не означает, что ваша сексуальная жизнь должна прекратиться.
                          </p>
                          <p>
                            Многие проблемы решаемы. Откровенный разговор с партнёром 
                            и врачом — первый шаг к решению.
                          </p>
                          <p>
                            Комплексный подход — сочетание медицинских и психологических 
                            методов — наиболее эффективен.
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
                        Изменения в сексуальности при менопаузе — это нормально. Основные причины 
                        включают гормональные изменения, сухость влагалища, психологические и физические 
                        факторы. Решения существуют: ЗГТ, местные эстрогены, лубриканты, психотерапия. 
                        Важно обсудить проблемы с партнёром и врачом. Здоровая сексуальность возможна 
                        в любом возрасте.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Источники */}
                <section>
                  <h3 className="text-h6 font-semibold text-deep-navy mb-3">Источники информации</h3>
                  <div className="space-y-2 text-body-small text-deep-navy/70">
                    <p>• Libido and Sexual Function in the Menopause</p>
                    <p>• EMAS position statements on sexual health in menopause</p>
                    <p>• International Society for Sexual Medicine guidelines</p>
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

