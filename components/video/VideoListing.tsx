'use client'

import { FC, useState, useEffect } from 'react'
import { VideoCard } from './VideoCard'
import type { EvaExplainsVideo } from '@/lib/types/video'
import { Loader2 } from 'lucide-react'

interface VideoListingProps {
  initialVideos?: EvaExplainsVideo[]
}

export const VideoListing: FC<VideoListingProps> = ({ initialVideos = [] }) => {
  const [videos, setVideos] = useState<EvaExplainsVideo[]>(initialVideos)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { value: 'all', label: 'Все видео' },
    { value: 'menopause', label: 'Менопауза' },
    { value: 'hormones', label: 'Гормоны и ЗГТ' },
    { value: 'nutrition', label: 'Питание' },
    { value: 'sports', label: 'Спорт и фитнес' },
    { value: 'mental_health', label: 'Психоэмоциональное здоровье' },
  ]

  useEffect(() => {
    // Filter videos by category
    if (selectedCategory === 'all') {
      setVideos(initialVideos)
    } else {
      setVideos(initialVideos.filter((video) => video.category === selectedCategory))
    }
  }, [selectedCategory, initialVideos])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-ocean-wave-start animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
        <p className="text-body text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 rounded-full text-body font-medium transition-colors ${
              selectedCategory === category.value
                ? 'bg-ocean-wave-start text-white'
                : 'bg-ocean-wave-start/10 text-deep-navy hover:bg-ocean-wave-start/20'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-16 bg-ocean-wave-start/5 rounded-2xl">
          <p className="text-body text-deep-navy/70">
            {selectedCategory === 'all'
              ? 'Видео скоро появятся'
              : 'Нет видео в этой категории'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}

