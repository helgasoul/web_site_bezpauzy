'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Bookmark, Clock, ExternalLink, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface SavedVideo {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  duration: number | null
  category: string | null
  saved_at: string
  video_url: string | null
}

interface SavedVideosProps {}

export const SavedVideos: FC<SavedVideosProps> = () => {
  const [videos, setVideos] = useState<SavedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSavedVideos()
  }, [])

  const fetchSavedVideos = async () => {
    try {
      const response = await fetch('/api/account/saved-videos', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить сохраненные видео')
      }
      
      const data = await response.json()
      setVideos(data.videos || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-purple animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
        <p className="text-body text-red-700">{error}</p>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="bg-lavender-bg rounded-2xl p-8 text-center">
        <Bookmark className="w-12 h-12 text-primary-purple/30 mx-auto mb-4" />
        <h3 className="text-h5 font-semibold text-deep-navy mb-2">
          Пока нет сохраненных видео
        </h3>
        <p className="text-body text-deep-navy/70 mb-6">
          Сохраняйте интересные видео из видеотеки, чтобы вернуться к ним позже
        </p>
        <Link
          href="/videos"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <ExternalLink size={18} />
          <span>Перейти в видеотеку</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white rounded-2xl overflow-hidden border-2 border-lavender-bg hover:border-primary-purple/30 transition-all shadow-sm hover:shadow-md group"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gradient-to-br from-primary-purple/20 to-ocean-wave-start/20 overflow-hidden">
            {video.thumbnail_url ? (
              <Image
                src={video.thumbnail_url}
                alt={video.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-12 h-12 text-primary-purple/30" />
              </div>
            )}
            {/* Play overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-8 h-8 text-primary-purple ml-1" fill="currentColor" />
              </div>
            </div>
            {/* Duration badge */}
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Clock size={12} />
                {formatDuration(video.duration)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            {video.category && (
              <span className="inline-block text-xs font-medium text-primary-purple bg-primary-purple/10 px-2 py-1 rounded mb-2">
                {video.category}
              </span>
            )}
            <h3 className="text-h6 font-semibold text-deep-navy mb-2 line-clamp-2">
              {video.title}
            </h3>
            {video.description && (
              <p className="text-sm text-deep-navy/70 mb-3 line-clamp-2">
                {video.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-deep-navy/50">
                Сохранено {new Date(video.saved_at).toLocaleDateString('ru-RU')}
              </span>
              {video.video_url && (
                <Link
                  href={video.video_url}
                  className="text-primary-purple hover:text-ocean-wave-start transition-colors text-sm font-medium flex items-center gap-1"
                >
                  Смотреть
                  <ExternalLink size={14} />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

