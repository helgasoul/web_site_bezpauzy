'use client'

import { FC, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface VisualListProps {
  items: Array<{
    icon?: LucideIcon
    title: string
    description?: string
  }>
  variant?: 'default' | 'gradient' | 'cards'
}

export const VisualList: FC<VisualListProps> = ({
  items,
  variant = 'default',
}) => {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-gradient-to-br from-primary-purple/5 to-ocean-wave-start/5 rounded-2xl p-6 border border-primary-purple/20 shadow-sm hover:shadow-md transition-shadow"
          >
            {item.icon && (
              <div className="w-12 h-12 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-xl flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-white" />
              </div>
            )}
            <h4 className="text-h5 font-bold text-deep-navy mb-2">
              {item.title}
            </h4>
            {item.description && (
              <p className="text-body-small text-deep-navy/70">
                {item.description}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="my-8 space-y-4">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="flex items-start gap-4 p-4 bg-lavender-bg rounded-xl hover:bg-primary-purple/5 transition-colors"
        >
          {item.icon && (
            <div className="w-10 h-10 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-lg flex items-center justify-center flex-shrink-0">
              <item.icon className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-body font-semibold text-deep-navy mb-1">
              {item.title}
            </h4>
            {item.description && (
              <p className="text-body-small text-deep-navy/70">
                {item.description}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

