'use client'

import { FC } from 'react'

interface IconProps {
  className?: string
}

export const StagesIcon: FC<IconProps> = ({ className = '' }) => {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path 
        d="M8 28 L12 24 L16 26 L20 18 L24 22 L28 14 L32 20" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
      <path 
        d="M28 18 L30 16 L32 18 L30 14 Z" 
        fill="white"
      />
      <circle cx="12" cy="24" r="2.5" fill="white" />
      <circle cx="20" cy="18" r="2.5" fill="white" />
      <circle cx="28" cy="14" r="2.5" fill="white" />
    </svg>
  )
}
