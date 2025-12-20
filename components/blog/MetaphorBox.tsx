'use client'

import { FC, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface MetaphorBoxProps {
  title: string
  children: ReactNode
  emoji?: string
}

export const MetaphorBox: FC<MetaphorBoxProps> = ({
  title,
  children,
  emoji,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative my-10 p-8 bg-gradient-to-br from-primary-purple/10 via-ocean-wave-start/10 to-warm-accent/10 rounded-3xl border-2 border-primary-purple/20 shadow-lg overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-purple/5 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-ocean-wave-start/5 rounded-full blur-2xl -ml-12 -mb-12" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          {emoji && <span className="text-3xl">{emoji}</span>}
          <Sparkles className="w-6 h-6 text-primary-purple" />
          <h3 className="text-h4 font-bold text-deep-navy">{title}</h3>
        </div>
        <div className="text-body text-deep-navy/85 leading-relaxed">
          {children}
        </div>
      </div>
    </motion.div>
  )
}

