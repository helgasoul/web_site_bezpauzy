'use client'

import { FC } from 'react'

interface IconProps {
  className?: string
}

export const SymptomsIcon: FC<IconProps> = ({ className = '' }) => {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path 
        d="M8 22 L12 18 L14 22 L16 14 L18 20 L20 12 L22 24 L24 14 L26 20 L28 12 L30 18 L32 22" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
    </svg>
  )
}
