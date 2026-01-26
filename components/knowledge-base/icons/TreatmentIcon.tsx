'use client'

import { FC } from 'react'

interface IconProps {
  className?: string
}

export const TreatmentIcon: FC<IconProps> = ({ className = '' }) => {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path 
        d="M20 12 C20 12, 15 10, 15 15 C15 19, 20 28, 20 28 C20 28, 25 19, 25 15 C25 10, 20 12, 20 12 Z" 
        fill="white" 
        fillOpacity="0.9"
        stroke="white" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <path 
        d="M20 16 L20 24 M16 20 L24 20" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
    </svg>
  )
}
