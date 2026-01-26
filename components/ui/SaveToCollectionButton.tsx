'use client'

import { FC, useState } from 'react'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface SaveToCollectionButtonProps {
  contentType: 'article' | 'quiz' | 'checklist'
  contentId: string
  title: string
  description?: string
  url: string
  metadata?: Record<string, any>
  className?: string
  variant?: 'default' | 'small'
}

export const SaveToCollectionButton: FC<SaveToCollectionButtonProps> = ({
  contentType,
  contentId,
  title,
  description,
  url,
  metadata,
  className = '',
  variant = 'default',
}) => {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    if (isSaved) {
      // Если уже сохранено, можно перейти к сохраненному контенту
      router.push('/community/dashboard?tab=saved')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/account/saved-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          title,
          description,
          url,
          metadata,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          // Пользователь не авторизован
          router.push('/community/dashboard')
          return
        }
        throw new Error(error.error || 'Ошибка при сохранении')
      }

      setIsSaved(true)
    } catch (error) {
      console.error('Error saving content:', error)
      // Можно показать уведомление об ошибке
    } finally {
      setIsLoading(false)
    }
  }

  const isSmall = variant === 'small'
  const buttonClasses = isSmall
    ? 'px-4 py-2 text-sm'
    : 'px-6 py-3 text-body'

  return (
    <motion.button
      onClick={handleSave}
      disabled={isLoading}
      whileHover={{ scale: isSaved ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ${buttonClasses}
        ${className}
        inline-flex items-center gap-2
        font-semibold rounded-xl
        transition-all duration-200
        ${
          isSaved
            ? 'bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white shadow-lg'
            : 'bg-white border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className={`${isSmall ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} />
          <span>{isSmall ? 'Сохранение...' : 'Сохранение...'}</span>
        </>
      ) : isSaved ? (
        <>
          <BookmarkCheck className={isSmall ? 'w-4 h-4' : 'w-5 h-5'} fill="currentColor" />
          <span>{isSmall ? 'В подборке' : 'Сохранено в подборку'}</span>
        </>
      ) : (
        <>
          <Bookmark className={isSmall ? 'w-4 h-4' : 'w-5 h-5'} />
          <span>{isSmall ? 'Сохранить' : 'Сохранить в подборку'}</span>
        </>
      )}
    </motion.button>
  )
}

