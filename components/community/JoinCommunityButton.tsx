'use client'

import { FC, useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { CommunityJoinModal } from './CommunityJoinModal'
import { CommunityMemberModal } from './CommunityMemberModal'

interface JoinCommunityButtonProps {
  className?: string
  variant?: 'default' | 'outline'
}

const COMMUNITY_EMAIL_KEY = 'bezpauzy_community_email'

export const JoinCommunityButton: FC<JoinCommunityButtonProps> = ({ 
  className = '',
  variant = 'default'
}) => {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [memberName, setMemberName] = useState<string>()

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
        setIsMemberModalOpen(true)
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

  const handleClick = async () => {
    // Check if we have email in localStorage
    const savedEmail = typeof window !== 'undefined' 
      ? localStorage.getItem(COMMUNITY_EMAIL_KEY) 
      : null

    if (savedEmail) {
      // Check if this email is registered
      const isMember = await checkMemberStatus(savedEmail)
      if (isMember) {
        return // Member modal will open
      }
    }

    // If no saved email or not a member, show join modal
    setIsJoinModalOpen(true)
  }

  // Handle successful registration from modal
  useEffect(() => {
    const handleStorageChange = () => {
      const savedEmail = localStorage.getItem(COMMUNITY_EMAIL_KEY)
      if (savedEmail) {
        checkMemberStatus(savedEmail)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const baseClasses = "group inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg md:text-xl font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300"
  
  const variantClasses = variant === 'default' 
    ? "bg-white text-primary-purple hover:bg-warm-accent hover:text-white"
    : "bg-transparent border-2 border-white text-white hover:bg-white/10"

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isChecking}
        className={`${baseClasses} ${variantClasses} ${className} ${isChecking ? 'opacity-50 cursor-wait' : ''}`}
        aria-label="Присоединиться к сообществу «Без паузы»"
      >
        <span>{isChecking ? 'Проверка...' : 'Присоединиться к сообществу'}</span>
        {!isChecking && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
      </button>
      <CommunityJoinModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={(email, name) => {
          // Save email to localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem(COMMUNITY_EMAIL_KEY, email)
          }
          setMemberName(name)
          setIsJoinModalOpen(false)
          setIsMemberModalOpen(true)
        }}
      />
      <CommunityMemberModal 
        isOpen={isMemberModalOpen} 
        onClose={() => setIsMemberModalOpen(false)}
        memberName={memberName}
      />
    </>
  )
}

