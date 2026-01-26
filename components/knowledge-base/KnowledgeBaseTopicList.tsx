'use client'

import { FC, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { KnowledgeBaseCategory } from '@/lib/types/knowledge-base'
import { SleepTopicModal } from './SleepTopicModal'
import { MoodTopicModal } from './MoodTopicModal'
import { BonesJointsTopicModal } from './BonesJointsTopicModal'
import { LibidoTopicModal } from './LibidoTopicModal'
import { HeartVesselsTopicModal } from './HeartVesselsTopicModal'
import { HotFlashesTopicModal } from './HotFlashesTopicModal'
import { WeightMetabolismTopicModal } from './WeightMetabolismTopicModal'
import { SkinHairTopicModal } from './SkinHairTopicModal'

interface KnowledgeBaseTopicListProps {
  category: KnowledgeBaseCategory
}

export const KnowledgeBaseTopicList: FC<KnowledgeBaseTopicListProps> = ({ category }) => {
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false)
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false)
  const [isBonesJointsModalOpen, setIsBonesJointsModalOpen] = useState(false)
  const [isLibidoModalOpen, setIsLibidoModalOpen] = useState(false)
  const [isHeartVesselsModalOpen, setIsHeartVesselsModalOpen] = useState(false)
  const [isHotFlashesModalOpen, setIsHotFlashesModalOpen] = useState(false)
  const [isWeightMetabolismModalOpen, setIsWeightMetabolismModalOpen] = useState(false)
  const [isSkinHairModalOpen, setIsSkinHairModalOpen] = useState(false)

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 overflow-hidden bg-lavender-bg/50">
        <div className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-montserrat text-3xl md:text-4xl lg:text-5xl font-bold text-deep-navy mb-4">
                {category.title}
              </h1>
              <p className="font-inter text-base md:text-lg text-deep-navy/80 max-w-2xl mx-auto">
                {category.description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="pt-8 md:pt-12 pb-16 md:pb-24 bg-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {category.topics.map((topic, index) => {
              // Для тем "Сон", "Настроение", "Кости и суставы" и "Либидо" открываем модалку, для остальных — переход на страницу
              const isSleepTopic = topic.slug === 'son'
              const isMoodTopic = topic.slug === 'nastroenie'
              const isBonesJointsTopic = topic.slug === 'kosti-sustavy'
              const isLibidoTopic = topic.slug === 'libido'
              const isPrilivyTopic = topic.slug === 'prilivy'
              const isVesMetabolizmTopic = topic.slug === 'ves-metabolizm'
              const isKozhaVolosyTopic = topic.slug === 'kozha-volosy'
              const isSerdtseSosudyTopic = topic.slug === 'serdtse-sosudy'
              const isZgtTopic = topic.slug === 'zgt'
              const isAlternativyTopic = topic.slug === 'alternativy'
              const isObrazZhizniTopic = topic.slug === 'obraz-zhizni'
              
              // Определяем, какие темы открывают модалку, а какие идут напрямую на страницу
              const shouldOpenModal = isSleepTopic || isMoodTopic || isBonesJointsTopic || isLibidoTopic || isSerdtseSosudyTopic || isPrilivyTopic || isVesMetabolizmTopic || isKozhaVolosyTopic
              
              const CardContent = (
                <div className="bg-soft-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 h-full flex flex-col border border-lavender-bg group-hover:border-primary-purple/30 cursor-pointer relative">
                  {/* Декоративный градиент при наведении */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/0 via-primary-purple/0 to-ocean-wave-start/0 group-hover:from-primary-purple/5 group-hover:via-primary-purple/3 group-hover:to-ocean-wave-start/5 transition-all duration-500 pointer-events-none rounded-card z-0" />
                  {/* Image из конфигурации (универсальная логика) */}
                  {topic.image && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src={topic.image}
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* Image для темы "Приливы" (fallback для тем без image в конфигурации) */}
                  {!topic.image && isPrilivyTopic && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src="/для карточки базы знаний -1.png"
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* Image для темы "Сон" (fallback для тем без image в конфигурации) */}
                  {!topic.image && isSleepTopic && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src="/Карточка сон-2.png"
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* Image для темы "Настроение" (fallback для тем без image в конфигурации) */}
                  {!topic.image && isMoodTopic && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src="/Настроение Карточка 3.png"
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* Image для темы "Либидо" (fallback для тем без image в конфигурации) */}
                  {!topic.image && isLibidoTopic && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src="/карточка  либидо -4.png"
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* Image для темы "Вес и метаболизм" (fallback для тем без image в конфигурации) */}
                  {!topic.image && isVesMetabolizmTopic && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src="/Вес и метаболизм карточка -5.png"
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* Image для темы "Кожа и волосы" (fallback для тем без image в конфигурации) */}
                  {!topic.image && isKozhaVolosyTopic && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src="/Волосы карточка -6.png"
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* Image для темы "Кости и суставы" (fallback для тем без image в конфигурации) */}
                  {!topic.image && isBonesJointsTopic && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src="/Кости и суставы карточка -7 .png"
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* Image для темы "Сердце и сосуды" (fallback для тем без image в конфигурации) */}
                  {!topic.image && isSerdtseSosudyTopic && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src="/карточка -8 сердце и сосуды.png"
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* Image для темы "Гормональная терапия (ЗГТ)" */}
                  {!topic.image && isZgtTopic && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src="/card_ZGT.png"
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* Image для темы "Альтернативные методы" */}
                  {!topic.image && isAlternativyTopic && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src="/card_alter_m.png"
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  {/* Image для темы "Образ жизни" */}
                  {!topic.image && isObrazZhizniTopic && (
                    <div className="relative w-full h-48 mb-4 overflow-hidden">
                      <Image
                        src="/card_obraz_zh.png"
                        alt={topic.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col flex-grow relative z-10">
                    {/* Декоративный элемент */}
                    <div className="absolute top-6 right-6 w-1 h-12 bg-gradient-to-b from-primary-purple/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Title */}
                    <h3 className="text-h5 font-semibold text-deep-navy mb-3 group-hover:bg-gradient-to-r group-hover:from-primary-purple group-hover:to-ocean-wave-start group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 relative">
                      <span className="relative z-10">{topic.title}</span>
                    </h3>

                    {/* Description */}
                    <p className="text-body-small text-deep-navy/70 mb-4 flex-grow group-hover:text-deep-navy/85 transition-colors duration-300">
                      {topic.description}
                    </p>

                    {/* Short content if available (для карточки "Приливы") */}
                    {topic.shortContent && (
                      <div className="text-body-small text-deep-navy/60 mb-4 line-clamp-3 group-hover:text-deep-navy/75 transition-colors duration-300">
                        <ReactMarkdown
                          components={{
                            p: ({ children }: any) => <span>{children}</span>,
                            strong: ({ children }: any) => (
                              <strong className="font-semibold text-deep-navy/90 group-hover:text-primary-purple/80 transition-colors duration-300">
                                {children}
                              </strong>
                            ),
                            h2: ({ children }: any) => <span className="font-semibold text-deep-navy/90">{children}</span>,
                            h3: ({ children }: any) => <span className="font-semibold text-deep-navy/90">{children}</span>,
                          }}
                        >
                          {topic.shortContent.replace(/\n\n/g, ' ').replace(/\n/g, ' ')}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Stats if available */}
                    {topic.stats && (
                      <div className="mb-4 px-4 py-3 bg-gradient-to-br from-lavender-bg to-lavender-bg/50 rounded-lg border border-lavender-bg/60 group-hover:border-primary-purple/30 group-hover:shadow-sm transition-all duration-300">
                        <div className="text-2xl font-bold bg-gradient-to-r from-primary-purple to-ocean-wave-start bg-clip-text text-transparent">
                          {topic.stats.percentage}%
                        </div>
                        <div className="text-body-small text-deep-navy/70 group-hover:text-deep-navy/80 transition-colors duration-300">
                          {topic.stats.text}
                        </div>
                      </div>
                    )}

                    {/* Disclaimer */}
                    <div className="mb-4 px-3 py-2.5 bg-lavender-bg/40 border border-primary-purple/10 rounded-lg">
                      <p className="text-[11px] leading-relaxed text-deep-navy/65">
                        <span className="font-semibold text-deep-navy/75">Важно:</span>{' '}
                        Данная информация носит ознакомительный характер и не заменяет консультацию врача. 
                        Все препараты должны назначаться и приниматься исключительно под контролем квалифицированного специалиста. 
                        Не занимайтесь самолечением.
                      </p>
                    </div>

                    {/* Link/Button */}
                    <div className="flex items-center gap-2 text-primary-purple group-hover:gap-3 transition-all pt-4 border-t border-lavender-bg group-hover:border-primary-purple/30 mt-auto relative">
                      <span className="text-body-small font-medium group-hover:font-semibold transition-all duration-300">
                        {isPrilivyTopic || isVesMetabolizmTopic || isKozhaVolosyTopic || isSleepTopic || isMoodTopic || isBonesJointsTopic || isLibidoTopic || isSerdtseSosudyTopic ? 'Узнать подробнее' : 'Изучить тему'}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              )

              // Определяем обработчик клика для карточки
              const handleCardClick = () => {
                if (isSleepTopic) {
                  setIsSleepModalOpen(true)
                } else if (isMoodTopic) {
                  setIsMoodModalOpen(true)
                } else if (isBonesJointsTopic) {
                  setIsBonesJointsModalOpen(true)
                } else if (isLibidoTopic) {
                  setIsLibidoModalOpen(true)
                } else if (isSerdtseSosudyTopic) {
                  setIsHeartVesselsModalOpen(true)
                } else if (isPrilivyTopic) {
                  setIsHotFlashesModalOpen(true)
                } else if (isVesMetabolizmTopic) {
                  setIsWeightMetabolismModalOpen(true)
                } else if (isKozhaVolosyTopic) {
                  setIsSkinHairModalOpen(true)
                }
              }

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {shouldOpenModal ? (
                    <div
                      onClick={handleCardClick}
                      className="group block h-full"
                    >
                      {CardContent}
                    </div>
                  ) : (
                    <Link
                      href={`/knowledge-base/${category.slug}/${topic.slug}`}
                      className="group block h-full"
                    >
                      {CardContent}
                    </Link>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Sleep Topic Modal */}
      <SleepTopicModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        topicSlug="son"
        categorySlug={category.slug}
      />

      {/* Mood Topic Modal */}
      <MoodTopicModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        topicSlug="nastroenie"
        categorySlug={category.slug}
      />

      {/* Bones & Joints Topic Modal */}
      <BonesJointsTopicModal
        isOpen={isBonesJointsModalOpen}
        onClose={() => setIsBonesJointsModalOpen(false)}
        topicSlug="kosti-sustavy"
        categorySlug={category.slug}
      />

      {/* Libido Topic Modal */}
      <LibidoTopicModal
        isOpen={isLibidoModalOpen}
        onClose={() => setIsLibidoModalOpen(false)}
        topicSlug="libido"
        categorySlug={category.slug}
      />

      {/* Heart & Vessels Topic Modal */}
      <HeartVesselsTopicModal
        isOpen={isHeartVesselsModalOpen}
        onClose={() => setIsHeartVesselsModalOpen(false)}
        topicSlug="serdtse-sosudy"
        categorySlug={category.slug}
      />

      {/* Hot Flashes Topic Modal */}
      <HotFlashesTopicModal
        isOpen={isHotFlashesModalOpen}
        onClose={() => setIsHotFlashesModalOpen(false)}
        topicSlug="prilivy"
        categorySlug={category.slug}
      />

      {/* Weight & Metabolism Topic Modal */}
      <WeightMetabolismTopicModal
        isOpen={isWeightMetabolismModalOpen}
        onClose={() => setIsWeightMetabolismModalOpen(false)}
        topicSlug="ves-metabolizm"
        categorySlug={category.slug}
      />

      {/* Skin & Hair Topic Modal */}
      <SkinHairTopicModal
        isOpen={isSkinHairModalOpen}
        onClose={() => setIsSkinHairModalOpen(false)}
        topicSlug="kozha-volosy"
        categorySlug={category.slug}
      />
    </>
  )
}

