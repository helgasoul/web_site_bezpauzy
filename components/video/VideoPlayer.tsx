'use client'

import { FC } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, User, Headphones, Sparkles, Lock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { VideoContent } from '@/lib/video/get-videos'

interface VideoPlayerProps {
  video: VideoContent
}

export const VideoPlayer: FC<VideoPlayerProps> = ({ video }) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getVideoEmbedUrl = (): string => {
    if (video.videoType === 'youtube' && video.videoId) {
      return `https://www.youtube.com/embed/${video.videoId}`
    }
    if (video.videoType === 'vimeo' && video.videoId) {
      return `https://player.vimeo.com/video/${video.videoId}`
    }
    // For direct links or Telegram, we'll use a different approach
    return video.videoUrl
  }

  const getVideoWatchUrl = (): string => {
    if (video.videoType === 'youtube' && video.videoId) {
      return `https://www.youtube.com/watch?v=${video.videoId}`
    }
    if (video.videoType === 'vimeo' && video.videoId) {
      return `https://vimeo.com/${video.videoId}`
    }
    return video.videoUrl
  }

  const isPaid = video.accessLevel !== 'free'
  const isEmbeddable = video.videoType === 'youtube' || video.videoType === 'vimeo'

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Type Badge */}
          <div className="flex items-center gap-3 mb-6">
            {video.contentType === 'podcast' ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-purple/10 text-primary-purple rounded-full text-sm font-medium">
                <Headphones className="w-4 h-4" />
                noPause подкаст
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-ocean-wave-start/20 text-ocean-wave-end rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Ева объясняет
              </span>
            )}
            <span className="text-body-small text-deep-navy/60">{video.categoryName}</span>
            {isPaid && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-purple text-white rounded-full text-xs font-semibold">
                <Lock className="w-3 h-3" />
                {video.accessLevel === 'paid1' ? 'Paid1' : 'Paid2'}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-h1 font-bold text-deep-navy mb-4">
            {video.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-body-small text-deep-navy/70">
            {video.contentType === 'podcast' && video.guestExpertName ? (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>
                  <strong>Гость:</strong> {video.guestExpertName}
                  {video.guestExpertRole && `, ${video.guestExpertRole}`}
                </span>
              </div>
            ) : video.contentType === 'eva_explains' && video.topic ? (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span><strong>Тема:</strong> {video.topic}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(video.duration)}</span>
            </div>
            {video.viewsCount > 0 && (
              <span>{video.viewsCount.toLocaleString()} просмотров</span>
            )}
          </div>

          {/* Video Player */}
          <div className="mb-8">
            {isEmbeddable ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
                <iframe
                  src={getVideoEmbedUrl()}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-primary-purple/20 to-ocean-wave-start/20">
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-24 h-24 text-primary-purple/50" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <a
                    href={getVideoWatchUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary-purple hover:bg-primary-purple/90 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3 transition-all hover:scale-105 shadow-lg"
                  >
                    <span>Смотреть видео</span>
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-lavender-bg">
            <h2 className="text-h3 font-bold text-deep-navy mb-4">О видео</h2>
            <p className="text-body text-deep-navy/80 leading-relaxed whitespace-pre-line">
              {video.description}
            </p>
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {video.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-lavender-bg text-deep-navy rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Access Warning for Paid Content */}
          {isPaid && (
            <div className="bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10 rounded-2xl border-2 border-primary-purple/20 p-6 mb-8">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-primary-purple flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-h4 font-bold text-deep-navy mb-2">
                    Доступ по подписке
                  </h3>
                  <p className="text-body text-deep-navy/80 mb-4">
                    Это видео доступно только для подписчиков {video.accessLevel === 'paid1' ? 'Paid1 (800₽/мес)' : 'Paid2 (2500₽/мес)'}.
                  </p>
                  <Link href="/chat">
                    <Button
                      variant="primary"
                      className="inline-flex items-center gap-2"
                    >
                      Оформить подписку
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Transcript */}
          {video.transcript && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-lavender-bg">
              <h2 className="text-h3 font-bold text-deep-navy mb-4">Расшифровка</h2>
              <div className="text-body text-deep-navy/80 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                {video.transcript}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

