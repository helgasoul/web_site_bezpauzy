'use client'
import { FC, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { CommunityJoinModal } from './CommunityJoinModal'

interface JoinCommunityButtonProps {
  className?: string
  variant?: 'default' | 'outline'
}

export const JoinCommunityButton: FC<JoinCommunityButtonProps> = ({
  className = '',
  variant = 'default'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const baseClasses = "group inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg md:text-xl font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300"

  const variantClasses = variant === 'default'
    ? "bg-white text-primary-purple hover:bg-warm-accent hover:text-white"
    : "bg-transparent border-2 border-white text-white hover:bg-white/10"

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${baseClasses} ${variantClasses} ${className}`}
        aria-label="Присоединиться к сообществу «Без паузы»"
      >
        <span>Присоединиться к сообществу</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
      <CommunityJoinModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
