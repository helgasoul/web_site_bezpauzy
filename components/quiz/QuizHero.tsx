'use client'

import { motion } from 'framer-motion'

export const QuizHero = () => {
  return (
    <section className="bg-gradient-to-br from-primary-purple via-ocean-wave-start to-primary-purple py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-h1 md:text-h1-lg font-bold text-soft-white mb-6">
              Квизы и тесты
            </h1>
            <p className="text-xl md:text-2xl text-soft-white/90 mb-8 leading-relaxed">
              Пройдите бесплатные квизы для оценки вашего состояния здоровья и получите персонализированные рекомендации
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


