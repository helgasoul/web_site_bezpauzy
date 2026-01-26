'use client'

import { FC, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Heart, TrendingUp, AlertTriangle, CheckCircle2, Activity, Shield, Users } from 'lucide-react'
import { MedicalDisclaimer } from '@/components/ui/MedicalDisclaimer'

interface HeartVesselsTopicModalProps {
  isOpen: boolean
  onClose: () => void
  topicSlug?: string
  categorySlug?: string
}

export const HeartVesselsTopicModal: FC<HeartVesselsTopicModalProps> = ({ isOpen, onClose, topicSlug = 'serdtse-sosudy', categorySlug = 'symptoms' }) => {
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
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-h3 font-bold mb-2">Сердце и сосуды при менопаузе</h2>
                      <p className="text-white/90 text-body">
                        Сердечно-сосудистые риски и изменения
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
                      <div className="text-3xl font-bold text-primary-purple mb-1">50%</div>
                      <div className="text-body-small text-deep-navy/70">
                        всех смертей у женщин после менопаузы связаны с сердечно-сосудистыми заболеваниями
                      </div>
                    </div>
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-ocean-wave-start mb-1">32%</div>
                      <div className="text-body-small text-deep-navy/70">
                        риск развития ишемической болезни сердца в течение жизни
                      </div>
                    </div>
                    <div className="bg-lavender-bg rounded-card p-4 border border-lavender-bg/50">
                      <div className="text-3xl font-bold text-warm-accent mb-1">10-20 лет</div>
                      <div className="text-body-small text-deep-navy/70">
                        отставание частоты ИБС у женщин по сравнению с мужчинами
                      </div>
                    </div>
                  </div>
                </section>

                {/* Влияние менопаузы */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary-purple" />
                    Как менопауза влияет на сердце и сосуды
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Дефицит эстрогена',
                        description: 'Эстроген защищает сердечно-сосудистую систему. После менопаузы снижение эстрогена приводит к увеличению риска сердечно-сосудистых заболеваний',
                        icon: Heart,
                        gradient: 'from-primary-purple to-ocean-wave-start',
                      },
                      {
                        title: 'Изменения метаболизма',
                        description: 'Увеличение абдоминального жира, снижение чувствительности к инсулину и неблагоприятные изменения липидного профиля',
                        icon: Activity,
                        gradient: 'from-ocean-wave-start to-warm-accent',
                      },
                      {
                        title: 'Окислительный стресс',
                        description: 'После менопаузы уровень окислительного стресса быстро возрастает, что увеличивает риск сердечно-сосудистых событий',
                        icon: Shield,
                        gradient: 'from-warm-accent to-primary-purple',
                      },
                      {
                        title: 'Эндотелиальная дисфункция',
                        description: 'Эстроген улучшает функцию сосудов и поддерживает эндотелий. После менопаузы эти защитные эффекты снижаются',
                        icon: Heart,
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

                {/* Защитные механизмы эстрогена */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary-purple" />
                    Как эстроген защищает сердце и сосуды
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Улучшение функции сосудов',
                        description: 'Эстроген увеличивает синтез оксида азота (NO) и простациклина, что улучшает вазодилатацию и защищает от атеросклероза',
                        highlight: 'Сосудистая защита',
                        color: 'primary-purple',
                      },
                      {
                        title: 'Противовоспалительное действие',
                        description: 'Снижает синтез провоспалительных цитокинов и модулирует воспалительный ответ, защищая от повреждения сосудов',
                        highlight: 'Анти-воспаление',
                        color: 'ocean-wave-start',
                      },
                      {
                        title: 'Антиоксидантные эффекты',
                        description: 'Увеличивает активность супероксиддисмутазы, способствуя очищению от свободных радикалов и снижению окислительного стресса',
                        highlight: 'Антиоксидант',
                        color: 'warm-accent',
                      },
                      {
                        title: 'Восстановление эндотелия',
                        description: 'Способствует восстановлению эндотелия сосудов и неоангиогенезу, улучшая кровоснабжение тканей',
                        highlight: 'Регенерация',
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

                {/* Профилактика */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary-purple" />
                    Профилактика сердечно-сосудистых заболеваний
                  </h3>
                  <div className="bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10 rounded-card p-6 border border-primary-purple/20">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-deep-navy mb-1">Отказ от курения</div>
                          <div className="text-body text-deep-navy/80">
                            Курение — один из основных факторов риска сердечно-сосудистых заболеваний. Отказ от курения значительно снижает риск.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-deep-navy mb-1">Контроль артериального давления</div>
                          <div className="text-body text-deep-navy/80">
                            Регулярный мониторинг и поддержание нормального артериального давления (менее 120/80 мм рт.ст.) критически важно.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-deep-navy mb-1">Регулярные аэробные упражнения</div>
                          <div className="text-body text-deep-navy/80">
                            Не менее 150 минут умеренной физической активности в неделю (ходьба, плавание, велосипед) улучшают здоровье сердца.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-deep-navy mb-1">Контроль диабета и липидов</div>
                          <div className="text-body text-deep-navy/80">
                            Поддержание нормального уровня глюкозы и холестерина (ЛПНП менее 100 мг/дл, ЛПВП более 50 мг/дл) снижает риск.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-deep-navy mb-1">Снижение веса</div>
                          <div className="text-body text-deep-navy/80">
                            Поддержание здорового веса и уменьшение абдоминального жира улучшает метаболические показатели и снижает риск ССЗ.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Менопаузальная гормональная терапия */}
                <section>
                  <h3 className="text-h5 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary-purple" />
                    Менопаузальная гормональная терапия (МГТ)
                  </h3>
                  <div className="bg-gradient-to-r from-ocean-wave-start/10 to-primary-purple/10 rounded-card p-6 border border-ocean-wave-start/20">
                    <div className="space-y-4">
                      <div>
                        <div className="font-semibold text-deep-navy mb-2">Гипотеза критического окна</div>
                        <p className="text-body text-deep-navy/80 mb-3">
                          Эффект МГТ на сердечно-сосудистую систему зависит от возраста начала терапии и времени от наступления менопаузы.
                        </p>
                        <div className="bg-white/50 rounded-lg p-4 border border-primary-purple/20">
                          <div className="font-semibold text-primary-purple mb-2">Оптимальный период для начала МГТ:</div>
                          <ul className="space-y-1 text-body-small text-deep-navy/70">
                            <li>• Женщины моложе 60 лет</li>
                            <li>• Менее 10 лет с момента менопаузы</li>
                            <li>• При наличии показаний (вазомоторные симптомы)</li>
                          </ul>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-ocean-wave-start/20">
                        <p className="text-body-small text-deep-navy/70">
                          <strong>Важно:</strong> МГТ не является препаратом первой линии для профилактики ССЗ. 
                          У женщин с симптомами менопаузы в раннем постменопаузальном периоде МГТ может иметь 
                          благоприятное влияние на сердечно-сосудистую систему, но решение должно приниматься 
                          индивидуально с врачом.
                        </p>
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
                        Сердечно-сосудистые заболевания — основная причина смерти у женщин после менопаузы. 
                        Дефицит эстрогена после менопаузы увеличивает риск ССЗ через множественные механизмы: 
                        изменения метаболизма, увеличение окислительного стресса, эндотелиальную дисфункцию. 
                        Профилактика критически важна: отказ от курения, контроль артериального давления, 
                        регулярные упражнения, контроль диабета и липидов, поддержание здорового веса. 
                        МГТ может иметь благоприятное влияние на сердечно-сосудистую систему, если начата 
                        в раннем постменопаузальном периоде (до 60 лет, менее 10 лет с менопаузы), но решение 
                        должно приниматься индивидуально с врачом.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Источники */}
                <section>
                  <h3 className="text-h6 font-semibold text-deep-navy mb-3">Источники информации</h3>
                  <div className="space-y-2 text-body-small text-deep-navy/70">
                    <p>• Сердечно-сосудистые заболевания и менопауза (Каретто М., Джаннини А., Симончини Т., Дженаццани А.Р.)</p>
                    <p>• WHI (Women&apos;s Health Initiative) исследования</p>
                    <p>• KEEPS (Kronos Early Estrogen Prevention Study)</p>
                    <p>• ELITE (Early versus Late Intervention Trial with Estradiol)</p>
                    <p>• Danish Osteoporosis Prevention Study</p>
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

