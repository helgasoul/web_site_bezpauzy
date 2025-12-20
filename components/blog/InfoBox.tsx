'use client'

import { FC, ReactNode } from 'react'
import { Info, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface InfoBoxProps {
  type?: 'info' | 'warning' | 'success' | 'danger'
  title?: string
  children: ReactNode
  icon?: ReactNode
}

export const InfoBox: FC<InfoBoxProps> = ({ 
  type = 'info', 
  title, 
  children,
  icon 
}) => {
  const config = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      iconColor: 'text-blue-600',
      icon: <Info className="w-6 h-6" />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      iconColor: 'text-yellow-600',
      icon: <AlertCircle className="w-6 h-6" />,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      iconColor: 'text-green-600',
      icon: <CheckCircle2 className="w-6 h-6" />,
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      iconColor: 'text-red-600',
      icon: <XCircle className="w-6 h-6" />,
    },
  }

  const style = config[type]
  const displayIcon = icon || style.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`${style.bg} ${style.border} border-2 rounded-2xl p-6 my-8 shadow-sm`}
    >
      <div className="flex items-start gap-4">
        <div className={`${style.iconColor} flex-shrink-0 mt-1`}>
          {displayIcon}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className={`${style.text} font-bold text-lg mb-2`}>
              {title}
            </h4>
          )}
          <div className={`${style.text} text-base leading-relaxed`}>
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

