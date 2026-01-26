import { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { PodcastPlayer } from '@/components/video/PodcastPlayer'
import { getVideoBySlug } from '@/lib/supabase/video'
import { formatDuration } from '@/lib/utils/video'
import { Clock, Calendar, User, FileText } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ShareButtons } from '@/components/ui/ShareButtons'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateVideoObjectSchema, generateBreadcrumbListSchema } from '@/lib/seo/schema'
import type { PodcastEpisode } from '@/lib/types/video'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data: video } = await getVideoBySlug(params.slug)

  if (!video || video.content_type !== 'podcast') {
    return {
      title: 'Эпизод не найден | Без | Паузы',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'
  const imageUrl = video.thumbnail_url 
    ? (video.thumbnail_url.startsWith('http') 
        ? video.thumbnail_url 
        : `${siteUrl}${video.thumbnail_url}`)
    : `${siteUrl}/og-default.png`
  const episodeUrl = `${siteUrl}/podcasts/nopause/${video.slug}`

  return {
    title: video.meta_title || `${video.title} | Подкаст noPause`,
    description: video.meta_description || video.description,
    alternates: {
      canonical: episodeUrl,
    },
    openGraph: {
      title: video.meta_title || video.title,
      description: video.meta_description || video.description,
      type: 'website',
      url: episodeUrl,
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

export default async function PodcastEpisodePage({ params }: PageProps) {
  const { data: video, error } = await getVideoBySlug(params.slug)

  if (!video || error || video.content_type !== 'podcast') {
    notFound()
  }

  const episode = video as PodcastEpisode

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
    { label: 'noPause Подкаст', href: '/podcasts/nopause' },
    { label: episode.title, href: `/podcasts/nopause/${episode.slug}` },
  ]

  // Генерация структурированных данных
  const videoSchema = generateVideoObjectSchema({
    name: episode.title,
    description: episode.description || '',
        thumbnailUrl: episode.thumbnail_url || '/og-default.png',
    uploadDate: episode.published_at || episode.created_at || new Date().toISOString(),
    duration: episode.duration ? formatDuration(episode.duration) : undefined,
    contentUrl: episode.video_url || undefined,
    embedUrl: episode.video_type === 'youtube' && episode.video_url ? episode.video_url : undefined,
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

          {/* Podcast Player */}
          <div className="mb-8">
            <PodcastPlayer episode={episode} showTranscript={true} />
          </div>

          {/* Episode Info */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-card p-8 md:p-12">
              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-lavender-bg text-primary-purple text-body-small font-semibold rounded-full">
                    {episode.category_name}
                  </span>
                  {episode.access_level !== 'free' && (
                    <span className="px-3 py-1 bg-primary-purple text-white text-body-small font-semibold rounded-full">
                      {episode.access_level === 'paid1' ? 'Paid1' : 'Paid2'}
                    </span>
                  )}
                </div>
                <h1 className="text-h1 font-bold text-deep-navy mb-4">{episode.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-body-small text-deep-navy/60">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDuration(episode.duration)}
                  </span>
                  {episode.published_at && (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(episode.published_at)}
                    </span>
                  )}
                  {episode.guest_expert_name && (
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {episode.guest_expert_name}
                      {episode.guest_expert_role && `, ${episode.guest_expert_role}`}
                    </span>
                  )}
                  {episode.views_count > 0 && (
                    <span>{episode.views_count.toLocaleString('ru-RU')} просмотров</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-body text-deep-navy/80 leading-relaxed whitespace-pre-line">
                  {episode.description}
                </p>
              </div>

              {/* Guest Info */}
              {episode.guest_expert_name && (
                <div className="bg-lavender-bg rounded-xl p-6 mb-8">
                  <h3 className="text-h4 font-semibold text-deep-navy mb-3">Гость эпизода</h3>
                  <div className="flex items-start gap-4">
                    {episode.guest_expert_avatar && (
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-purple/10 flex-shrink-0 relative">
                        <Image
                          src={episode.guest_expert_avatar}
                          alt={episode.guest_expert_name || 'Гость эпизода'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-body font-semibold text-deep-navy">
                        {episode.guest_expert_name}
                      </p>
                      {episode.guest_expert_role && (
                        <p className="text-body-small text-deep-navy/70">
                          {episode.guest_expert_role}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              {episode.timestamps && episode.timestamps.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-h4 font-semibold text-deep-navy mb-4">Содержание</h3>
                  <ul className="space-y-2">
                    {episode.timestamps.map((timestamp, index) => (
                      <li key={index} className="flex items-center gap-3 text-body text-deep-navy/80">
                        <span className="text-body-small text-primary-purple font-mono">
                          {formatDuration(timestamp.time)}
                        </span>
                        <span>{timestamp.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {episode.tags && episode.tags.length > 0 && (
                <div className="mb-8">
                  <div className="flex flex-wrap gap-2">
                    {episode.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-lavender-bg text-deep-navy text-body-small rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcript Section */}
              {episode.transcript && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-h4 font-semibold text-deep-navy flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-purple" />
                      Транскрипт эпизода
                    </h3>
                  </div>
                  <div className="bg-lavender-bg rounded-xl p-6 max-h-96 overflow-y-auto">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-body text-deep-navy/80 leading-relaxed whitespace-pre-line">
                        {episode.transcript}
                      </p>
                    </div>
                  </div>
                  <p className="text-body-small text-deep-navy/60 mt-4">
                    Транскрипт автоматически сгенерирован и может содержать неточности
                  </p>
                </div>
              )}

              {/* Share */}
              <div className="border-t border-lavender-bg pt-6">
                <ShareButtons
                  url={`/podcasts/nopause/${episode.slug}`}
                  title={episode.title}
                  description={episode.description || undefined}
                  variant="default"
                />
              </div>
            </div>
          </div>
        </article>
    </div>
  )
}

