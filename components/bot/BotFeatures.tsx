'use client'

import { FC } from 'react'
import { MessageCircle, Users, Video, ClipboardList, Bell, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

interface BotFeaturesProps {}

export const BotFeatures: FC<BotFeaturesProps> = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Отвечать на вопросы',
      description: 'На основе научных источников и вашей истории',
      gradient: 'from-primary-purple/30 to-primary-purple/10',
    },
    {
      icon: Users,
      title: 'Рекомендовать врачей',
      description: '500+ специалистов в базе по всей России и СНГ',
      gradient: 'from-ocean-wave-start/30 to-ocean-wave-end/10',
    },
    {
      icon: Video,
      title: 'Подбирать видео',
      description: 'Персонализированные курсы от врачей',
      gradient: 'from-warm-accent/30 to-warm-accent/10',
    },
    {
      icon: ClipboardList,
      title: 'Создавать чек-листы',
      description: 'Практические списки для вашей ситуации',
      gradient: 'from-primary-purple/30 to-ocean-wave-start/10',
    },
    {
      icon: Bell,
      title: 'Напоминать о здоровье',
      description: 'О приёме добавок, визитах к врачу, анализах',
      gradient: 'from-ocean-wave-start/30 to-warm-accent/10',
    },
    {
      icon: Heart,
      title: 'Вести дневник симптомов',
      description: 'Отслеживайте изменения и делитесь с врачом',
      gradient: 'from-warm-accent/30 to-primary-purple/10',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.h2
          className="text-h2 font-bold text-deep-navy text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Что умеет Ева?
        </motion.h2>
        
        <motion.p
          className="text-body-large text-deep-navy/70 text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Полный набор инструментов для поддержки в период менопаузы
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-lavender-bg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-primary-purple" />
                </div>

                {/* Content */}
                <h3 className="text-h5 font-semibold text-deep-navy mb-3">
                  {feature.title}
                </h3>
                <p className="text-body text-deep-navy/70">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
