'use client'

import { FC } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, TrendingDown, Sparkles } from 'lucide-react'

interface PhenoAgeQuizButtonProps {
  articleTitle?: string
}

export const PhenoAgeQuizButton: FC<PhenoAgeQuizButtonProps> = ({ articleTitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="my-12"
    >
      <div className="bg-gradient-to-br from-primary-purple/10 via-ocean-wave-start/10 to-warm-accent/10 rounded-3xl p-8 md:p-10 border-2 border-primary-purple/30 shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-purple/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-ocean-wave-start/5 rounded-full blur-2xl -ml-12 -mb-12" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-xl flex items-center justify-center shadow-md">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-h4 font-bold text-deep-navy">Узнайте свой биологический возраст</h3>
            </div>
          </div>

          <p className="text-body text-deep-navy/80 mb-6 leading-relaxed">
            Калькулятор PhenoAge определяет ваш биологический возраст на основе биохимических маркеров крови. 
            Узнайте, насколько ваш организм соответствует хронологическому возрасту, и получите персонализированные рекомендации.
          </p>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-deep-navy/70">
              <span className="w-2 h-2 bg-primary-purple rounded-full" />
              <span>9 биомаркеров крови + возраст</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-deep-navy/70">
              <span className="w-2 h-2 bg-primary-purple rounded-full" />
              <span>Научно обоснованная методика (Levine et al., 2018)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-deep-navy/70">
              <span className="w-2 h-2 bg-primary-purple rounded-full" />
              <span>Персонализированная интерпретация результата</span>
            </div>
          </div>

          <Link href="/quiz/phenoage">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              <span>Рассчитать биологический возраст</span>
            </motion.div>
          </Link>

          <p className="text-caption text-deep-navy/60 text-center mt-4">
            Бесплатно • 5-7 минут • Без регистрации
          </p>
        </div>
      </div>
    </motion.div>
  )
}

