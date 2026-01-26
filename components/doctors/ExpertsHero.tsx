'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { assetUrl } from '@/lib/assets'

export const ExpertsHero = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={assetUrl('/project_experts.png')}
          alt="Фон секции экспертов"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-lavender-bg/90 via-lavender-bg/80 to-lavender-bg/90" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h1 className="text-h1 md:text-display font-bold text-deep-navy mb-6">
            Эксперты проекта
          </h1>
          <p className="text-h5 text-deep-navy/70 mb-8 leading-relaxed">
            Наша команда специалистов поможет вам разобраться в вопросах здоровья в менопаузе. 
            Каждый эксперт — профессионал в своей области с многолетним опытом работы.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

