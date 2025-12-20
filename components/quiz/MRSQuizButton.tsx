'use client'

import { FC } from 'react'
import Link from 'next/link'
import { Activity, Award } from 'lucide-react'
import { motion } from 'framer-motion'

interface MRSQuizButtonProps {
  articleTitle?: string
}

export const MRSQuizButton: FC<MRSQuizButtonProps> = ({ articleTitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="my-10 p-6 bg-gradient-to-br from-primary-purple/10 to-ocean-wave-start/10 rounded-2xl border border-primary-purple/20 shadow-md flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center mb-4 shadow-lg">
        <Activity className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-h4 font-bold text-deep-navy mb-2">
        Оцените ваши симптомы менопаузы
      </h3>
      <p className="text-body text-deep-navy/70 mb-6 max-w-prose">
        Пройдите квиз Menopause Rating Scale (MRS) — стандартный опросник для оценки симптомов менопаузы. Ответьте на 11 вопросов, чтобы узнать уровень тяжести симптомов и получить рекомендации.
      </p>
      <Link href="/quiz/mrs" passHref>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-primary text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Award className="w-5 h-5" />
          Пройти квиз MRS →
        </motion.button>
      </Link>
      <p className="text-caption text-deep-navy/60 mt-4">
        11 вопросов • 3-5 минут • Бесплатно
      </p>
    </motion.div>
  )
}

