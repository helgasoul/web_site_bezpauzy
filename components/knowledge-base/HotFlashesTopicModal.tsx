'use client'

import { FC, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Droplet, TrendingUp, AlertCircle, CheckCircle2, Activity, Heart } from 'lucide-react'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

interface HotFlashesTopicModalProps {
  isOpen: boolean
  onClose: () => void
  topicSlug?: string
  categorySlug?: string
}

export const HotFlashesTopicModal: FC<HotFlashesTopicModalProps> = ({ 
  isOpen, 
  onClose, 
  topicSlug = 'prilivy', 
  categorySlug = 'symptoms' 
}) => {
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

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
                      <Droplet className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-h3 font-bold mb-2">Приливы</h2>
                      <p className="text-white/90 text-body">
                        Почему возникают приливы, как их облегчить и что делать
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
                  <div className="bg-lavender-bg rounded-card p-6 border border-lavender-bg/50">
                    <div className="text-4xl font-bold text-primary-purple mb-2">75-80%</div>
                    <div className="text-body text-deep-navy/70">
                      женщин испытывают приливы в период перименопаузы и менопаузы
                    </div>
                    <div className="mt-4 pt-4 border-t border-lavender-bg/50 text-body-small text-deep-navy/60">
                      В среднем приливы длятся 7.4 года, но у некоторых женщин они могут продолжаться до 10-15 лет.
                    </div>
                  </div>
                </section>

                {/* Основные причины */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-primary-purple" />
                    Почему возникают приливы?
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Снижение эстрогенов',
                        description: 'Падение уровня эстрогенов на 60-80% нарушает терморегуляцию в гипоталамусе — центре контроля температуры тела',
                        icon: Activity,
                        gradient: 'from-primary-purple to-ocean-wave-start',
                      },
                      {
                        title: 'Вазомоторные симптомы',
                        description: 'Внезапное расширение кровеносных сосудов вызывает прилив жара и последующую потливость',
                        icon: Heart,
                        gradient: 'from-ocean-wave-start to-warm-accent',
                      },
                      {
                        title: 'Триггеры',
                        description: 'Алкоголь, острая пища, горячие напитки, стресс, жаркая погода могут провоцировать приливы',
                        icon: AlertCircle,
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

                {/* Эффективные способы облегчения */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary-purple" />
                    10 способов облегчить приливы
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Одевайтесь слоями — можно быстро снять один слой',
                      'Используйте вентилятор в спальне',
                      'Избегайте триггеров: алкоголь, острая пища, горячие напитки',
                      'Практикуйте медленное глубокое дыхание',
                      'Поддерживайте прохладную температуру в помещении',
                      'Выбирайте натуральные ткани (хлопок, лён)',
                      'Регулярные физические упражнения',
                      'Управляйте стрессом через медитацию или йогу',
                      'Держите рядом бутылку холодной воды',
                      'Ведите дневник приливов, чтобы найти триггеры',
                    ].map((tip, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-lavender-bg/50 border border-lavender-bg rounded-card"
                      >
                        <CheckCircle2 className="w-4 h-4 text-primary-purple flex-shrink-0 mt-0.5" />
                        <span className="text-body-small text-deep-navy/80">{tip}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Миф и факт */}
                <section className="bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10 rounded-card p-6 border border-primary-purple/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-purple/20 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-primary-purple" />
                    </div>
                    <div>
                      <div className="font-semibold text-deep-navy mb-2">Миф и факт</div>
                      <p className="text-body text-deep-navy/80 mb-2">
                        <strong>Миф:</strong> Приливы можно просто перетерпеть, они пройдут сами.
                      </p>
                      <p className="text-body text-deep-navy/80">
                        <strong>Факт:</strong> Хотя приливы действительно могут уменьшиться со временем, они могут серьёзно влиять на качество жизни, сон и работоспособность. Существует множество эффективных методов облегчения симптомов — от изменения образа жизни до гормональной терапии.
                      </p>
                    </div>
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
