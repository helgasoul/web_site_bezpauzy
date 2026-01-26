'use client'

import { FC } from 'react'

interface IconProps {
  className?: string
}

export const MythsIcon: FC<IconProps> = ({ className = '' }) => {
  return (
    <svg 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path 
        d="M20 8 C24 8, 28 12, 28 16 C28 20, 26 24, 26 26 L26 28 C26 29.5, 24.5 31, 23 31 L17 31 C15.5 31, 14 29.5, 14 28 L14 26 C14 24, 12 20, 12 16 C12 12, 16 8, 20 8 Z" 
        fill="white" 
        fillOpacity="0.9"
        stroke="white" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <path 
        d="M20 13 C22 13, 24 15, 24 17.5 C24 20, 22 21.5, 20 21.5 C18 21.5, 16 20, 16 17.5 C16 15, 18 13, 20 13 Z" 
        fill="none" 
        stroke="white" 
        strokeWidth="1.5" 
        opacity="0.8"
      />
      <rect 
        x="17" 
        y="28" 
        width="6" 
        height="4" 
        rx="1" 
        fill="white"
      />
      <path 
        d="M14 26 L13 29 M26 26 L27 29 M20 28 L20 32" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  )
}
