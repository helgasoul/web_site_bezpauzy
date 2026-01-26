'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { BookOpen, Download, CheckCircle2, Heart, UtensilsCrossed, Sparkles, FileText } from 'lucide-react'
import { DownloadGuideButton } from '@/components/quiz/DownloadGuideButton'
import { ResourcePurchaseStatus } from '@/components/resources/ResourcePurchaseStatus'
import { BackButton } from '@/components/ui/BackButton'
import { assetUrl } from '@/lib/assets'

interface Guide {
  id: string
  title: string
  description: string
  icon: FC<{ className?: string }>
  downloadComponent?: FC
  comingSoon?: boolean
  coverImage?: string
}

const guides: Guide[] = [
  {
    id: 'anti-inflammatory-nutrition',
    title: 'Противовоспалительное питание',
    description: 'PDF-гайд с детальными рекомендациями, рецептами и планом питания на 21 день для снижения воспаления в организме.',
    icon: UtensilsCrossed,
    coverImage: '/Противовоспалительное пттание гайд.png',
    downloadComponent: () => <DownloadGuideButton guideId="anti-inflammatory-nutrition" label="Скачать гайд" />,
  },
  {
    id: 'hot-flashes-management',
    title: 'Управление приливами',
    description: 'Практическое руководство по уменьшению частоты и интенсивности приливов с помощью питания и образа жизни.',
    icon: Heart,
    coverImage: '/Гайд Управление приливами.png',
    comingSoon: true,
  },
  {
    id: 'sleep-improvement',
    title: 'Улучшение качества сна',
    description: 'Научно обоснованные методы для улучшения сна в период менопаузы.',
    icon: Sparkles,
    comingSoon: false, // Измените на false, когда добавите PDF
    coverImage: '/Гайд сон.png',
    downloadComponent: () => <DownloadGuideButton guideId="sleep-improvement" label="Скачать гайд" />,
  },
  {
    id: 'bone-health',
    title: 'Здоровье костей в менопаузе',
    description: 'Комплексный гайд по профилактике остеопороза: питание, упражнения, добавки.',
    icon: Heart,
    comingSoon: false, // Измените на false, когда добавите PDF
    coverImage: '/Гайд кости.png',
    downloadComponent: () => <DownloadGuideButton guideId="bone-health" label="Скачать гайд" />,
  },
]

export const GuidesPage: FC = () => {
  // Получаем email из localStorage (если был сохранен после покупки)
  const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('purchase_email') : null

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      {/* Статусы покупок для платных гайдов */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
        {guides
          .filter((guide) => !guide.comingSoon && guide.downloadComponent)
          .map((guide) => (
            <ResourcePurchaseStatus
              key={guide.id}
              resourceSlug={guide.id}
              email={savedEmail}
            />
          ))}
      </div>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary-purple to-ocean-wave-start overflow-hidden">
        {/* Фоновое изображение */}
        <div className="absolute inset-0 z-0">
          <Image
            src={assetUrl('/helgasoul_Elegant_abstract_illustration_of_gentle_waves_of_wa_7eb544cb-1f34-43b0-a75f-69583713dac0_3.png')}
            alt="Декоративный фон с волнами"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
        {/* Градиент overlay для читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/90 to-ocean-wave-start/90 z-[1]" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-body-small font-semibold text-white">Практические гайды</span>
            </div>
            <h1 className="text-h1 md:text-h1-desktop font-bold text-white mb-6">
              Гайды
            </h1>
            <p className="text-body-large text-white/90 leading-relaxed">
              Скачайте бесплатные гайды или приобретите платные с детальными рекомендациями по здоровью в период менопаузы. 
              Научно обоснованные советы, рецепты и планы действий.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {guides.map((guide, index) => {
              const Icon = guide.icon
              const hasCover = !!guide.coverImage
              
              return (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-soft-white rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 h-full flex flex-col border border-lavender-bg overflow-hidden ${
                    hasCover ? 'p-0' : 'p-6'
                  }`}
                >
                  {hasCover ? (
                    // Журнальная/книжная обложка стиль
                    <div className="relative w-full h-full flex flex-col">
                      {/* Обложка - занимает большую часть карточки */}
                      <div className="relative w-full aspect-[2/3] flex-shrink-0 overflow-hidden">
                        <Image
                          src={assetUrl(guide.coverImage!)}
                          alt={guide.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                          priority={index < 3}
                        />
                        {/* Overlay для лучшей читаемости текста сверху */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
                        
                        {/* Текст на обложке - сверху */}
                        <div className="absolute inset-0 flex flex-col justify-start p-6 z-10">
                          <div className="text-white">
                            <h3 className="text-xl md:text-2xl font-bold mb-2 drop-shadow-2xl leading-tight text-white/95">
                              {guide.id === 'anti-inflammatory-nutrition'
                                ? 'Гайд по противовоспалительному питанию'
                                : guide.id === 'sleep-improvement' 
                                ? 'Гайд по улучшению сна в менопаузе'
                                : guide.id === 'bone-health'
                                ? 'Гайд по здоровью костей в менопаузе'
                                : guide.id === 'hot-flashes-management'
                                ? 'Гайд по управлению приливами'
                                : guide.title
                              }
                            </h3>
                          </div>
                        </div>
                      </div>
                      
                      {/* Информация внизу */}
                      <div className="p-6 flex flex-col flex-grow">
                        <p className="text-body-small text-deep-navy/70 mb-4 flex-grow">
                          {guide.description}
                        </p>

                        {guide.comingSoon ? (
                          <div className="mt-auto">
                            <div className="bg-lavender-bg rounded-lg px-4 py-3 text-center">
                              <span className="text-body-small text-deep-navy/60">
                                Скоро
                              </span>
                            </div>
                          </div>
                        ) : guide.downloadComponent ? (
                          <div className="mt-auto">
                            {guide.downloadComponent({} as any)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    // Обычный стиль карточки
                    <>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-purple/10 to-ocean-wave-start/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary-purple" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-h5 font-bold text-deep-navy mb-2">
                            {guide.title}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-body-small text-deep-navy/70 mb-6 flex-grow">
                        {guide.description}
                      </p>

                      {guide.comingSoon ? (
                        <div className="mt-auto">
                          <div className="bg-lavender-bg rounded-lg px-4 py-3 text-center">
                            <span className="text-body-small text-deep-navy/60">
                              Скоро
                            </span>
                          </div>
                        </div>
                      ) : guide.downloadComponent ? (
                        <div className="mt-auto">
                          {guide.downloadComponent({} as any)}
                        </div>
                      ) : null}
                    </>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-lavender-bg to-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/90 to-ocean-wave-start/90" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-6" />
              <h2 className="text-h2 md:text-h1 font-bold mb-4">
                Практические знания для вашего здоровья
              </h2>
              <p className="text-body-large mb-8 text-white/90">
                Эти гайды помогут вам применить научные знания на практике и улучшить качество жизни в период менопаузы.
              </p>
              <p className="text-body text-white/80">
                💜 Помните: Ваше здоровье — в ваших руках
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

