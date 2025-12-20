'use client'

import { FC, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, LogIn } from 'lucide-react'
import { CommunityJoinModal } from './CommunityJoinModal'
import { CommunityLoginModal } from './CommunityLoginModal'
import { CommunityMemberModal } from './CommunityMemberModal'

interface CommunityAccessButtonsProps {
  className?: string
  variant?: 'default' | 'outline'
}

const COMMUNITY_EMAIL_KEY = 'bezpauzy_community_email'

export const CommunityAccessButtons: FC<CommunityAccessButtonsProps> = ({ 
  className = '',
  variant = 'default'
}) => {
  const router = useRouter()
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [memberName, setMemberName] = useState<string>()
  const [hasSavedEmail, setHasSavedEmail] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem(COMMUNITY_EMAIL_KEY)
      setHasSavedEmail(!!savedEmail)
    }
  }, [])

  const checkMemberStatus = async (email: string) => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/community/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.isMember) {
        setMemberName(result.member?.name)
        // Redirect to dashboard instead of showing modal
        router.push('/community/dashboard')
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking member status:', error)
      return false
    } finally {
      setIsChecking(false)
    }
  }

  const handleJoinClick = () => {
    setIsJoinModalOpen(true)
  }

  const handleLoginClick = async () => {
    const savedEmail = typeof window !== 'undefined' 
      ? localStorage.getItem(COMMUNITY_EMAIL_KEY) 
      : null

    if (savedEmail) {
      // Auto-check if email is saved
      await checkMemberStatus(savedEmail)
    } else {
      // Show login modal to enter email
      setIsLoginModalOpen(true)
    }
  }

  const handleLoginSuccess = (email: string, name?: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMMUNITY_EMAIL_KEY, email)
      if (name) {
        localStorage.setItem('bezpauzy_community_name', name)
      }
    }
    setHasSavedEmail(true)
    setMemberName(name)
    setIsLoginModalOpen(false)
    // Redirect to dashboard
    router.push('/community/dashboard')
  }

  const baseClasses = "group inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-7 py-3 sm:py-3.5 rounded-full text-sm sm:text-base md:text-lg font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300 whitespace-nowrap"
  
  const variantClasses = variant === 'default' 
    ? "bg-white text-primary-purple hover:bg-warm-accent hover:text-white shadow-md"
    : "bg-transparent border-2 border-white text-white hover:bg-white/10"

  const outlineClasses = variant === 'default'
    ? "bg-transparent border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white"
    : "bg-white/10 border-2 border-white/50 text-white hover:bg-white/20"

  // Check if className contains 'flex-col' to force vertical layout
  const forceVertical = className.includes('flex-col')
  
  return (
    <>
      <div className={`flex ${forceVertical ? 'flex-col' : 'flex-col sm:flex-row'} gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full ${className}`}>
        {/* Always show "Присоединиться" button */}
        <button
          onClick={handleJoinClick}
          className={`${baseClasses} ${variantClasses} ${forceVertical ? 'w-full' : 'w-full sm:w-auto flex-1 sm:flex-none'}`}
          aria-label="Присоединиться к сообществу «Без паузы»"
        >
          <span className={forceVertical ? '' : 'truncate'}>Присоединиться к сообществу</span>
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Always show "Войти" button */}
        <button
          onClick={handleLoginClick}
          disabled={isChecking}
          className={`${baseClasses} ${outlineClasses} ${forceVertical ? 'w-full' : 'w-full sm:w-auto flex-1 sm:flex-none'} ${isChecking ? 'opacity-50 cursor-wait' : ''}`}
          aria-label="Войти в сообщество «Без паузы»"
        >
          <LogIn className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className={forceVertical ? '' : 'truncate'}>{isChecking ? 'Проверка...' : 'Войти в сообщество'}</span>
        </button>
      </div>

      <CommunityJoinModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={(email, name) => {
          // Save email and name to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(COMMUNITY_EMAIL_KEY, email)
            localStorage.setItem('bezpauzy_community_name', name)
            setHasSavedEmail(true)
          }
          setMemberName(name)
          setIsJoinModalOpen(false)
          // Redirect to dashboard
          router.push('/community/dashboard')
        }}
      />
      <CommunityLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        onJoinClick={() => setIsJoinModalOpen(true)}
      />
      <CommunityMemberModal 
        isOpen={isMemberModalOpen} 
        onClose={() => setIsMemberModalOpen(false)}
        memberName={memberName}
      />
    </>
  )
}

