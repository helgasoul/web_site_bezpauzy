'use client'

import { FC } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Activity, TrendingDown, Sparkles } from 'lucide-react'

interface InflammationQuizButtonProps {
  articleTitle?: string
}

export const InflammationQuizButton: FC<InflammationQuizButtonProps> = ({ articleTitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="my-12"
    >
      <div className="bg-gradient-to-br from-warm-accent/10 via-primary-purple/10 to-ocean-wave-start/10 rounded-3xl p-8 md:p-10 border-2 border-warm-accent/30 shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-warm-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-purple/5 rounded-full blur-2xl -ml-12 -mb-12" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-warm-accent to-primary-purple rounded-xl flex items-center justify-center shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-warm-accent" />
              <h3 className="text-h4 font-bold text-deep-navy">Узнайте свой индекс воспаления</h3>
            </div>
          </div>

          <p className="text-body text-deep-navy/80 mb-6 leading-relaxed">
            Хроническое воспаление может усиливать симптомы менопаузы и повышать риск возрастных заболеваний. Пройдите бесплатный квиз и получите персонализированные рекомендации по питанию и образу жизни.
          </p>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-deep-navy/70">
              <span className="w-2 h-2 bg-warm-accent rounded-full" />
              <span>22 вопроса о питании и образе жизни</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-deep-navy/70">
              <span className="w-2 h-2 bg-warm-accent rounded-full" />
              <span>Персонализированные рекомендации</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-deep-navy/70">
              <span className="w-2 h-2 bg-warm-accent rounded-full" />
              <span>PDF-гайд с планом действий</span>
            </div>
          </div>

          <Link href="/quiz/inflammation">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-warm-accent to-primary-purple text-white px-8 py-4 rounded-full text-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              <span>Пройти квиз</span>
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

