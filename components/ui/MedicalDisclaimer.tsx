'use client'

import { FC } from 'react'
import { AlertCircle } from 'lucide-react'

interface MedicalDisclaimerProps {
  variant?: 'compact' | 'full'
  className?: string
}

export const MedicalDisclaimer: FC<MedicalDisclaimerProps> = ({ variant = 'full', className = '' }) => {
  const text = variant === 'compact' 
    ? 'Информация носит информационный характер и не является консультацией врача'
    : 'Информация на сайте носит информационный характер и не является медицинской консультацией, диагностикой или планом лечения. Проконсультируйтесь с врачом перед принятием решений о здоровье.'

  return (
    <div className={`flex items-start gap-3 p-4 bg-lavender-bg/50 border border-lavender-bg rounded-card ${className}`}>
      <AlertCircle className="w-5 h-5 text-deep-navy/60 flex-shrink-0 mt-0.5" />
      <p className="text-body-small text-deep-navy/70">
        {text}
      </p>
    </div>
  )
}

