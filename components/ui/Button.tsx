'use client'

import { FC, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className,
  ...props
}) => {
  const baseStyles = 'px-8 py-4 rounded-pill font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-purple focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-gradient-primary text-soft-white shadow-button hover:shadow-button-hover hover:-translate-y-0.5',
    secondary: 'bg-transparent text-primary-purple border-2 border-primary-purple hover:bg-primary-purple hover:text-soft-white',
    ghost: 'bg-transparent text-soft-white border-2 border-soft-white hover:bg-soft-white/10',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}

