import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Video, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface VideoContent {
  id: string
  title: string
  slug: string
  description?: string
  thumbnailUrl?: string
  duration?: number
  category?: string
  tags?: string[]
  isPaid?: boolean
}

interface TopicVideosProps {
  topicSlug: string
  topicTags?: string[]
}

/**
 * Получить видео по теме (по тегам или категории)
 */
async function getVideosForTopic(topicSlug: string, topicTags?: string[]): Promise<VideoContent[]> {
  try {
    const supabase = await createClient()
    
    // Получаем видео из таблицы video_content
    const { data, error } = await supabase
      .from('video_content')
      .select('*')
      .eq('published', true)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(6)

    if (error || !data || data.length === 0) {
      return []
    }

    // Используем теги из конфига, если они переданы
    const keywords = topicTags && Array.isArray(topicTags) && topicTags.length > 0 
      ? topicTags 
      : []
    
    // Маппим данные и фильтруем по тегам
    const videos: VideoContent[] = data
      .filter((video: any) => video && typeof video === 'object' && video.id && video.slug)
      .map((video: any) => ({
        id: String(video.id || ''),
        title: String(video.title || ''),
        slug: String(video.slug || ''),
        description: video.description || undefined,
        thumbnailUrl: video.thumbnail_url || undefined,
        duration: typeof video.duration_seconds === 'number' ? video.duration_seconds : undefined,
        category: video.category || undefined,
        tags: Array.isArray(video.tags) ? video.tags.filter((tag: any): tag is string => typeof tag === 'string' && tag.length > 0) : [],
        isPaid: Boolean(video.is_paid),
      }))
      .filter(video => {
        if (!video || !video.id || !video.slug) {
          return false
        }
        
        if (!video.tags || !Array.isArray(video.tags) || video.tags.length === 0) {
          return false
        }
        
        if (!keywords || keywords.length === 0) {
          return false
        }
        
        // Проверяем, есть ли пересечение тегов
        const videoTagsLower = video.tags
          .filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
          .map(tag => tag.toLowerCase())
        const keywordsLower = keywords
          .filter((k): k is string => typeof k === 'string' && k.length > 0)
          .map(k => k.toLowerCase())
        
        if (videoTagsLower.length === 0 || keywordsLower.length === 0) {
          return false
        }
        
        return videoTagsLower.some(tag => 
          keywordsLower.some(keyword => tag.includes(keyword) || keyword.includes(tag))
        )
      })

    return videos.slice(0, 6) // Максимум 6 видео
  } catch (error) {
    console.error('Error fetching videos for topic:', error)
    return []
  }
}

export async function TopicVideos({ topicSlug, topicTags }: TopicVideosProps) {
  try {
    const videos = await getVideosForTopic(topicSlug, topicTags)

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return <></>
    }

  return (
    <section className="py-12 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-h3 font-bold text-deep-navy mb-2 flex items-center gap-3">
            <Video className="w-6 h-6 text-primary-purple" />
            Видео по теме
          </h2>
          <p className="text-body text-deep-navy/70">
            Обучающие видео и интервью с экспертами
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id}>
              <Link
                href={`/videos/${video.category || 'eva-explains'}/${video.slug}`}
                className="group block h-full"
              >
                <div className="bg-soft-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border border-lavender-bg">
                  {/* Thumbnail */}
                  <div className="w-full h-48 relative overflow-hidden bg-lavender-bg">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/40 to-ocean-wave-start/40 flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-white/80" />
                      </div>
                    )}
                    
                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <PlayCircle className="w-12 h-12 text-white/90 group-hover:scale-110 transition-transform" />
                    </div>

                    {/* Duration badge */}
                    {video.duration && (
                      <div className="absolute bottom-3 right-3 z-10">
                        <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-body-small font-semibold rounded text-xs">
                          {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    )}

                    {/* Paid badge */}
                    {video.isPaid && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-3 py-1 bg-primary-purple text-white text-body-small font-semibold rounded-full shadow-sm">
                          Платно
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-h6 font-semibold text-deep-navy mb-2 group-hover:text-primary-purple transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-body-small text-deep-navy/70 mb-4 flex-grow line-clamp-2">
                        {video.description}
                      </p>
                    )}

                    {/* Link */}
                    <div className="flex items-center gap-2 text-primary-purple group-hover:gap-3 transition-all pt-4 border-t border-lavender-bg">
                      <PlayCircle className="w-4 h-4" />
                      <span className="text-body-small font-medium">Смотреть видео</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
    )
  } catch (error) {
    console.error('Error in TopicVideos component:', error)
    return <></>
  }
}
