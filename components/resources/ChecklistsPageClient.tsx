'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FileText, CheckCircle2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import type { Resource } from '@/lib/supabase/resources'
import { DownloadResourceButton } from './DownloadResourceButton'
import { SaveToCollectionButton } from '@/components/ui/SaveToCollectionButton'
import { BackButton } from '@/components/ui/BackButton'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'
import type { LucideIcon } from 'lucide-react'

interface ChecklistsPageClientProps {
  resources: Resource[]
}

// Маппинг имен иконок из строки в компоненты Lucide
const iconMap: Record<string, LucideIcon> = {
  Stethoscope: Icons.Stethoscope,
  Calendar: Icons.Calendar,
  Plane: Icons.Plane,
  FileText: Icons.FileText,
  CheckCircle2: Icons.CheckCircle2,
} as Record<string, LucideIcon>

export const ChecklistsPageClient: FC<ChecklistsPageClientProps> = ({ resources }) => {
  // Если ресурсов нет, показываем пустое состояние
  if (!resources || resources.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
          <BackButton variant="ghost" />
        </div>
        <section className="py-16 md:py-24 bg-soft-white">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-body-large text-deep-navy/70">
                Чек-листы скоро появятся
              </p>
            </div>
          </div>
        </section>
        <AskEvaWidget />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary-purple to-ocean-wave-start overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/90 to-ocean-wave-start/90" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <FileText className="w-5 h-5 text-white" />
              <span className="text-body-small font-semibold text-white">Бесплатные ресурсы</span>
            </div>
            <h1 className="text-h1 md:text-h1-desktop font-bold text-white mb-6">
              Чек-листы для вашего здоровья
            </h1>
            <p className="text-body-large text-white/90 leading-relaxed">
              Скачайте бесплатные чек-листы, которые помогут вам подготовиться к визиту к врачу, отслеживать симптомы и управлять здоровьем в период менопаузы.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Checklists Grid */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {resources.map((resource, index) => {
              const Icon = resource.iconName && iconMap[resource.iconName] 
                ? iconMap[resource.iconName] 
                : Icons.FileText
              const hasCover = !!resource.coverImage
              
              return (
                <motion.div
                  key={resource.id}
                  id={resource.slug}
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
                      {/* Обложка */}
                      <div className="relative w-full aspect-[2/3] flex-shrink-0 overflow-hidden">
                        <Image
                          src={resource.coverImage!}
                          alt={resource.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                          priority={index < 3}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
                        
                        {/* Текст на обложке */}
                        <div className="absolute inset-0 flex flex-col justify-start p-6 z-10">
                          <div className="text-white">
                            <h3 className="text-xl md:text-2xl font-bold mb-2 drop-shadow-2xl leading-tight text-white/95">
                              {resource.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                      
                      {/* Информация внизу */}
                      <div className="p-6 flex flex-col flex-grow">
                        <p className="text-body-small text-deep-navy/70 mb-4 flex-grow">
                          {resource.description}
                        </p>

                        {resource.comingSoon ? (
                          <div className="mt-auto">
                            <div className="bg-lavender-bg rounded-lg px-4 py-3 text-center">
                              <span className="text-body-small text-deep-navy/60">
                                Скоро
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-auto space-y-3">
                            <DownloadResourceButton resource={resource} label="Скачать PDF" />
                            <SaveToCollectionButton
                              contentType="checklist"
                              contentId={resource.slug}
                              title={resource.title}
                              description={resource.description}
                              url={`/resources/checklists#${resource.slug}`}
                              variant="small"
                            />
                          </div>
                        )}
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
                            {resource.title}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-body-small text-deep-navy/70 mb-6 flex-grow">
                        {resource.description}
                      </p>

                      {resource.comingSoon ? (
                        <div className="mt-auto">
                          <div className="bg-lavender-bg rounded-lg px-4 py-3 text-center">
                            <span className="text-body-small text-deep-navy/60">
                              Скоро
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-auto space-y-3">
                          <DownloadResourceButton resource={resource} label="Скачать PDF" />
                          <SaveToCollectionButton
                            contentType="checklist"
                            contentId={resource.slug}
                            title={resource.title}
                            description={resource.description}
                            url={`/resources/checklists#${resource.slug}`}
                            variant="small"
                          />
                        </div>
                      )}
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
                Знание — это сила
              </h2>
              <p className="text-body-large mb-8 text-white/90">
                Эти чек-листы помогут вам быть подготовленной к визиту к врачу и принимать информированные решения о своём здоровье.
              </p>
              <p className="text-body text-white/80">
                💜 Помните: Ваше здоровье — в ваших руках
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      
      <AskEvaWidget />
    </main>
  )
}

