'use client'

import { FC, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface StepCardProps {
  step: number
  title: string
  children: ReactNode
  icon?: ReactNode
}

export const StepCard: FC<StepCardProps> = ({
  step,
  title,
  children,
  icon,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative my-6"
    >
      <div className="flex items-start gap-4">
        {/* Step number */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-xl flex items-center justify-center shadow-md">
            {icon || (
              <span className="text-white font-bold text-lg">{step}</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl p-6 border-2 border-lavender-bg shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-h5 font-bold text-deep-navy mb-3">{title}</h4>
          <div className="text-body text-deep-navy/80 leading-relaxed">
            {children}
          </div>
        </div>
      </div>

      {/* Connector line (except for last item) */}
      {step < 4 && (
        <div className="absolute left-6 top-16 w-0.5 h-full bg-gradient-to-b from-primary-purple/30 to-transparent" />
      )}
    </motion.div>
  )
}

