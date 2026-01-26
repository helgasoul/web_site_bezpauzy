'use client'

import { FC, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Activity, TrendingUp, AlertTriangle, Bone, Heart, CheckCircle2, Users, Shield } from 'lucide-react'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

interface BonesJointsTopicModalProps {
  isOpen: boolean
  onClose: () => void
  topicSlug?: string
  categorySlug?: string
}

export const BonesJointsTopicModal: FC<BonesJointsTopicModalProps> = ({ isOpen, onClose, topicSlug = 'kosti-sustavy', categorySlug = 'symptoms' }) => {
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
                      <Bone className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-h3 font-bold mb-2">Кости и суставы при менопаузе</h2>
                      <p className="text-white/90 text-body">
                        Остеопороз, здоровье костей и суставов
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
                    Почему это важно
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-primary-purple mb-1">20-30%</div>
                      <div className="text-body-small text-deep-navy/70">
                        потери костной массы в первые 5-7 лет после менопаузы
                      </div>
                    </div>
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-ocean-wave-start mb-1">50%</div>
                      <div className="text-body-small text-deep-navy/70">
                        женщин старше 50 лет имеют остеопению или остеопороз
                      </div>
                    </div>
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-warm-accent mb-1">1 из 3</div>
                      <div className="text-body-small text-deep-navy/70">
                        женщин старше 50 лет находятся в группе риска по переломам
                      </div>
                    </div>
                  </div>
                </section>

                {/* Основные факторы риска */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary-purple" />
                    Факторы риска
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Снижение эстрогена',
                        description: 'Эстроген защищает кости. После менопаузы потеря эстрогена ускоряет разрушение костной ткани',
                        icon: Heart,
                        gradient: 'from-primary-purple to-ocean-wave-start',
                      },
                      {
                        title: 'Дефицит витамина D',
                        description: 'Недостаток витамина D ухудшает усвоение кальция и здоровье костей',
                        icon: Shield,
                        gradient: 'from-ocean-wave-start to-warm-accent',
                      },
                      {
                        title: 'Недостаток кальция',
                        description: 'Низкое потребление кальция с пищей увеличивает риск остеопороза',
                        icon: Bone,
                        gradient: 'from-warm-accent to-primary-purple',
                      },
                      {
                        title: 'Снижение физической активности',
                        description: 'Малоподвижный образ жизни ускоряет потерю костной массы',
                        icon: Activity,
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

                {/* Методы профилактики и лечения */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary-purple" />
                    Профилактика и лечение
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Заместительная гормональная терапия',
                        description: 'ЗГТ эффективна для профилактики потери костной массы, особенно если начата в ранней менопаузе. Рекомендуется женщинам с высоким риском остеопороза.',
                        highlight: 'Защита костей',
                        color: 'primary-purple',
                      },
                      {
                        title: 'Кальций и витамин D',
                        description: 'Рекомендуется 1000-1200 мг кальция и 800-1000 МЕ витамина D в день. Витамин D критически важен для усвоения кальция.',
                        highlight: 'Основа здоровья',
                        color: 'ocean-wave-start',
                      },
                      {
                        title: 'Физические упражнения',
                        description: 'Силовые тренировки и упражнения с весовой нагрузкой (ходьба, бег, танцы) стимулируют рост костной ткани и укрепляют мышцы.',
                        highlight: 'Регулярная активность',
                        color: 'warm-accent',
                      },
                      {
                        title: 'Бисфосфонаты и другие препараты',
                        description: 'При диагностированном остеопорозе могут назначаться бисфосфонаты, деносумаб или другие лекарства для укрепления костей.',
                        highlight: 'При остеопорозе',
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

                {/* Диагностика */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary-purple" />
                    Диагностика
                  </h3>
                  <div className="bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10 rounded-card p-6 border border-primary-purple/20">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-deep-navy mb-1">Денситометрия (DEXA)</div>
                          <div className="text-body text-deep-navy/80">
                            Золотой стандарт диагностики остеопороза. Рекомендуется всем женщинам старше 65 лет и женщинам с факторами риска старше 50 лет.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-deep-navy mb-1">Анализ уровня витамина D</div>
                          <div className="text-body text-deep-navy/80">
                            Важно проверять уровень 25(OH)D в крови. Оптимальный уровень: 30-50 нг/мл (75-125 нмоль/л).
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                        <div className="flex-grow">
                          <div className="font-semibold text-deep-navy mb-1">Оценка риска переломов (FRAX)</div>
                          <div className="text-body text-deep-navy/80 mb-3">
                            Международный инструмент для оценки 10-летнего риска переломов на основе факторов риска. Помогает определить необходимость лечения.
                          </div>
                          <a
                            href="/quiz/frax"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-medium hover:shadow-button-hover transition-all text-sm"
                          >
                            <Activity className="w-4 h-4" />
                            Пройти квиз FRAX
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Ключевой вывод */}
                <section className="bg-gradient-to-r from-ocean-wave-start/10 to-primary-purple/10 rounded-card p-6 border border-ocean-wave-start/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-purple/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary-purple" />
                    </div>
                    <div>
                      <div className="font-semibold text-deep-navy mb-2">Главное</div>
                      <p className="text-body text-deep-navy/80">
                        Потеря костной массы начинается уже в перименопаузе и ускоряется после менопаузы — 
                        до 20-30% в первые 5-7 лет. Профилактика критически важна. ЗГТ, начатая в ранней 
                        менопаузе, эффективно защищает кости. Достаточное потребление кальция (1000-1200 мг/день) 
                        и витамина D (800-2000 МЕ/день, уровень ≥30 нг/мл), а также регулярные упражнения с 
                        весовой нагрузкой — основа здоровья костей. Регулярная денситометрия помогает выявить 
                        проблемы на ранней стадии, когда профилактика наиболее эффективна.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Источники */}
                <section>
                  <h3 className="text-h6 font-semibold text-deep-navy mb-3">Источники информации</h3>
                  <div className="space-y-2 text-body-small text-deep-navy/70">
                    <p>• Hormonal Management of Osteoporosis during the Menopause</p>
                    <p>• EMAS position statement: Vitamin D and postmenopausal health</p>
                    <p>• FRAX® - WHO Fracture Risk Assessment Tool</p>
                    <p>• International Osteoporosis Foundation guidelines</p>
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
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-medium hover:shadow-button-hover transition-all text-center"
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

