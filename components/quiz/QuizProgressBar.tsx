'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'

interface QuizProgressBarProps {
  progress: number
  current: number
  total: number
}

export const QuizProgressBar: FC<QuizProgressBarProps> = ({ progress, current, total }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-body-small font-semibold text-deep-navy">
          Вопрос {current} из {total}
        </span>
        <span className="text-body-small text-deep-navy/60">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-3 bg-lavender-bg rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary-purple to-ocean-wave-start rounded-full shadow-sm"
        />
      </div>
    </div>
  )
}

