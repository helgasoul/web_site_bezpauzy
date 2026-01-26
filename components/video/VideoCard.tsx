'use client'

import { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Play } from 'lucide-react'
import type { EvaExplainsVideo } from '@/lib/types/video'
import { formatDuration } from '@/lib/utils/video'
import { SaveVideoButton } from './SaveVideoButton'

interface VideoCardProps {
  video: EvaExplainsVideo
}

export const VideoCard: FC<VideoCardProps> = ({ video }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-lavender-bg">
      <Link href={`/videos/eva-explains/${video.slug}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-ocean-wave-start/20 to-warm-accent/20">
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-ocean-wave-start ml-1" fill="currentColor" />
            </div>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {video.access_level !== 'free' && (
              <div className="px-2 py-1 bg-ocean-wave-start text-white text-body-small font-semibold rounded-full">
                {video.access_level === 'paid1' ? 'Paid1' : 'Paid2'}
              </div>
            )}
            <SaveVideoButton videoId={video.id} size="sm" />
          </div>
          {video.topic && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-deep-navy text-body-small font-semibold rounded-full">
              {video.topic}
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        <Link href={`/videos/eva-explains/${video.slug}`} className="block">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-ocean-wave-start/10 text-ocean-wave-start text-body-small font-semibold rounded-full">
              {video.category_name}
            </span>
          </div>

          <h3 className="text-h4 font-semibold text-deep-navy mb-2 group-hover:text-ocean-wave-start transition-colors line-clamp-2">
            {video.title}
          </h3>

          <p className="text-body-small text-deep-navy/70 mb-4 line-clamp-2">
            {video.description}
          </p>

          <div className="flex items-center justify-between text-body-small text-deep-navy/60">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(video.duration)}
              </span>
              {video.published_at && (
                <span>{formatDate(video.published_at)}</span>
              )}
            </div>
            {video.views_count > 0 && (
              <span>{video.views_count.toLocaleString('ru-RU')} просмотров</span>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}

