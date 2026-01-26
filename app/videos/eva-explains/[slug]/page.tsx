import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { VideoPlayer } from '@/components/video/VideoPlayer'
import { getVideoBySlug } from '@/lib/supabase/video'
import { formatDuration } from '@/lib/utils/video'
import { Clock, Calendar, BookOpen } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ShareButtons } from '@/components/ui/ShareButtons'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateVideoObjectSchema, generateBreadcrumbListSchema } from '@/lib/seo/schema'
import type { EvaExplainsVideo } from '@/lib/types/video'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data: video } = await getVideoBySlug(params.slug)

  if (!video || video.content_type !== 'eva_explains') {
    return {
      title: 'Видео не найдено | Без | Паузы',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'
  const imageUrl = video.thumbnail_url 
    ? (video.thumbnail_url.startsWith('http') 
        ? video.thumbnail_url 
        : `${siteUrl}${video.thumbnail_url}`)
    : `${siteUrl}/og-default.png`
  const videoUrl = `${siteUrl}/videos/eva-explains/${video.slug}`

  return {
    title: video.meta_title || `${video.title} | Ева Объясняет`,
    description: video.meta_description || video.description,
    alternates: {
      canonical: videoUrl,
    },
    openGraph: {
      title: video.meta_title || video.title,
      description: video.meta_description || video.description,
      type: 'video.other',
      url: videoUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: video.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: video.meta_title || video.title,
      description: video.meta_description || video.description,
      images: [imageUrl],
    },
    other: {
      'telegram:channel': '@bezpauzi',
    },
  }
}

export default async function EvaExplainsVideoPage({ params }: PageProps) {
  const { data: video, error } = await getVideoBySlug(params.slug)

  if (!video || error || video.content_type !== 'eva_explains') {
    notFound()
  }

  const evaVideo = video as EvaExplainsVideo

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Ресурсы', href: '/knowledge-base' },
    { label: 'Ева объясняет', href: '/videos/eva-explains' },
    { label: evaVideo.title, href: `/videos/eva-explains/${evaVideo.slug}` },
  ]

  // Преобразуем EvaExplainsVideo (snake_case) в VideoContent (camelCase) для VideoPlayer
  const videoForPlayer = {
    id: evaVideo.id,
    title: evaVideo.title,
    slug: evaVideo.slug,
    description: evaVideo.description,
    contentType: evaVideo.content_type,
    topic: evaVideo.topic,
    videoUrl: evaVideo.video_url || '',
    videoType: 'direct' as const, // Для Supabase видео используем 'direct'
    videoId: evaVideo.video_id,
    thumbnailUrl: evaVideo.thumbnail_url,
    duration: evaVideo.duration,
    category: evaVideo.category,
    categoryName: evaVideo.category_name,
    metaTitle: evaVideo.meta_title,
    metaDescription: evaVideo.meta_description,
    metaKeywords: evaVideo.meta_keywords,
    accessLevel: evaVideo.access_level,
    published: evaVideo.published,
    publishedAt: evaVideo.published_at,
    viewsCount: evaVideo.views_count,
    likesCount: evaVideo.likes_count,
    tags: evaVideo.tags,
    transcript: evaVideo.transcript,
    timestamps: evaVideo.timestamps,
    relatedArticles: evaVideo.related_articles,
    relatedVideos: evaVideo.related_videos,
    createdAt: evaVideo.created_at,
    updatedAt: evaVideo.updated_at,
  }

  // Генерация структурированных данных
  // EvaExplainsVideo всегда использует Supabase storage, не YouTube
  const videoSchema = generateVideoObjectSchema({
    name: evaVideo.title,
    description: evaVideo.description || '',
        thumbnailUrl: evaVideo.thumbnail_url || '/og-default.png',
    uploadDate: evaVideo.published_at || evaVideo.created_at || new Date().toISOString(),
    duration: evaVideo.duration ? formatDuration(evaVideo.duration) : undefined,
    contentUrl: evaVideo.video_url || undefined,
    embedUrl: evaVideo.video_url || undefined, // Для Supabase видео используем video_url как embedUrl
  })

  const breadcrumbSchema = generateBreadcrumbListSchema(
    breadcrumbs.map((b) => ({ name: b.label, url: b.href }))
  )

  return (
    <div className="min-h-screen bg-soft-white">
      <StructuredData data={[videoSchema, breadcrumbSchema]} />
        <article className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} />

          {/* Video Player */}
          <div className="mb-8">
            <VideoPlayer video={videoForPlayer} />
          </div>

          {/* Video Info */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-card p-8 md:p-12">
              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-ocean-wave-start/10 text-ocean-wave-start text-body-small font-semibold rounded-full">
                    {evaVideo.category_name}
                  </span>
                  {evaVideo.topic && (
                    <span className="px-3 py-1 bg-warm-accent/10 text-warm-accent text-body-small font-semibold rounded-full">
                      {evaVideo.topic}
                    </span>
                  )}
                  {evaVideo.access_level !== 'free' && (
                    <span className="px-3 py-1 bg-ocean-wave-start text-white text-body-small font-semibold rounded-full">
                      {evaVideo.access_level === 'paid1' ? 'Paid1' : 'Paid2'}
                    </span>
                  )}
                </div>
                <h1 className="text-h1 font-bold text-deep-navy mb-4">{evaVideo.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-body-small text-deep-navy/60">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDuration(evaVideo.duration)}
                  </span>
                  {evaVideo.published_at && (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(evaVideo.published_at)}
                    </span>
                  )}
                  {evaVideo.views_count > 0 && (
                    <span>{evaVideo.views_count.toLocaleString('ru-RU')} просмотров</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-body text-deep-navy/80 leading-relaxed whitespace-pre-line">
                  {evaVideo.description}
                </p>
              </div>

              {/* Timestamps */}
              {evaVideo.timestamps && evaVideo.timestamps.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-h4 font-semibold text-deep-navy mb-4">Содержание</h3>
                  <ul className="space-y-2">
                    {evaVideo.timestamps.map((timestamp, index) => (
                      <li key={index} className="flex items-center gap-3 text-body text-deep-navy/80">
                        <span className="text-body-small text-ocean-wave-start font-mono">
                          {formatDuration(timestamp.time)}
                        </span>
                        <span>{timestamp.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Articles */}
              {evaVideo.related_articles && evaVideo.related_articles.length > 0 && (
                <div className="mb-8 bg-ocean-wave-start/5 rounded-xl p-6">
                  <h3 className="text-h4 font-semibold text-deep-navy mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Связанные статьи
                  </h3>
                  <p className="text-body-small text-deep-navy/70">
                    Статьи по теме скоро появятся здесь
                  </p>
                </div>
              )}

              {/* Tags */}
              {evaVideo.tags && evaVideo.tags.length > 0 && (
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    {evaVideo.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-ocean-wave-start/10 text-deep-navy text-body-small rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="border-t border-lavender-bg pt-6">
                <ShareButtons
                  url={`/videos/eva-explains/${evaVideo.slug}`}
                  title={evaVideo.title}
                  description={evaVideo.description || undefined}
                  variant="default"
                />
              </div>
            </div>
          </div>
        </article>
    </div>
  )
}

