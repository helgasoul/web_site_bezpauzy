'use client'

import { FC, useState } from 'react'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'

interface SaveVideoButtonProps {
  videoId: string
  className?: string
  size?: 'sm' | 'md'
}

export const SaveVideoButton: FC<SaveVideoButtonProps> = ({ 
  videoId, 
  className = '',
  size = 'md'
}) => {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/account/saved-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ video_id: videoId }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSaved(true)
      } else if (response.status === 409 && data.already_saved) {
        // Видео уже в подборке
        setIsSaved(true)
      } else if (response.status === 401) {
        // Не авторизован
        setError('Войдите в аккаунт для сохранения')
      } else {
        setError(data.error || 'Ошибка при сохранении')
      }
    } catch (err) {
      setError('Ошибка при сохранении')
      console.error('Error saving video:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const iconSize = size === 'sm' ? 16 : 20
  const buttonSize = size === 'sm' ? 'p-2' : 'p-2.5'

  return (
    <button
      onClick={handleSave}
      disabled={isLoading || isSaved}
      className={`
        ${buttonSize}
        rounded-full
        transition-all
        ${isSaved 
          ? 'bg-primary-purple text-white' 
          : 'bg-white/90 backdrop-blur-sm text-deep-navy hover:bg-primary-purple hover:text-white'
        }
        ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
        shadow-sm hover:shadow-md
        ${className}
      `}
      title={isSaved ? 'Видео уже в подборке' : 'Добавить в подборку'}
      aria-label={isSaved ? 'Видео уже в подборке' : 'Добавить в подборку'}
    >
      {isLoading ? (
        <Loader2 className={`w-${iconSize/4} h-${iconSize/4} animate-spin`} size={iconSize} />
      ) : isSaved ? (
        <BookmarkCheck size={iconSize} fill="currentColor" />
      ) : (
        <Bookmark size={iconSize} />
      )}
    </button>
  )
}
