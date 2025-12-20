'use client'

import { FC } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}

export const BackButton: FC<BackButtonProps> = ({
  className = '',
  variant = 'default'
}) => {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const baseClasses = "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-base font-medium transition-all duration-300 hover:scale-105"

  const variantClasses = {
    default: "bg-white text-primary-purple hover:bg-primary-purple hover:text-white shadow-md hover:shadow-lg",
    outline: "bg-transparent border-2 border-white text-white hover:bg-white/10",
    ghost: "bg-transparent text-deep-navy hover:bg-lavender-bg"
  }

  return (
    <button
      onClick={handleBack}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label="Вернуться назад"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Назад</span>
    </button>
  )
}

