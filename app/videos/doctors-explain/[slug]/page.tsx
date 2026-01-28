import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getVideoBySlug, getRelatedVideos } from '@/lib/video/get-videos'
import Link from 'next/link'
import { ArrowLeft, Clock, Eye, Calendar, Share2 } from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const video = await getVideoBySlug(params.slug)

  if (!video) {
    return {
      title: 'Видео не найдено | Без|Паузы'
    }
  }

  return {
    title: video.metaTitle || `${video.title} | Врачи Объясняют | Без|Паузы`,
    description: video.metaDescription || video.description,
    keywords: video.metaKeywords?.join(', '),
    openGraph: {
      title: video.title,
      description: video.description,
      images: [{ url: video.thumbnailUrl }],
      type: 'video.other',
    },
  }
}

export default async function DoctorsExplainVideoPage({ params }: PageProps) {
  const video = await getVideoBySlug(params.slug)

  if (!video || video.contentType !== 'doctors_explain') {
    notFound()
  }

  const relatedVideos = await getRelatedVideos(params.slug, video.category as any, 3)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  const getVideoEmbed = () => {
    if (video.videoType === 'youtube' && video.videoId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      )
    }

    if (video.videoType === 'vimeo' && video.videoId) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${video.videoId}`}
          title={video.title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      )
    }

    return (
      <video
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        controls
        className="w-full h-full"
      />
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="bg-gradient-to-b from-teal-50 to-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/videos/doctors-explain"
            className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Все видео
          </Link>
        </div>
      </div>

      {/* Video Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-black rounded-2xl overflow-hidden aspect-video">
              {getVideoEmbed()}
            </div>

            {/* Video Info */}
            <div>
              {/* Category Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 mb-3">
                {video.categoryName}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {video.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {video.viewsCount || 0} просмотров
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDuration(video.duration)}
                </div>
                {video.publishedAt && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(video.publishedAt)}
                  </div>
                )}
              </div>

              {/* Doctor Info */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 mb-6">
                <div className="flex items-start space-x-4">
                  {video.doctorAvatar ? (
                    <img
                      src={video.doctorAvatar}
                      alt={video.doctorName || 'Doctor'}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
                      {video.doctorName?.charAt(0) || 'D'}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {video.doctorName}
                    </h3>
                    <p className="text-teal-700 font-medium mb-2">
                      {video.doctorSpecialty}
                    </p>
                    {video.doctorCredentials && (
                      <p className="text-sm text-gray-600">
                        {video.doctorCredentials}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {video.description}
                </p>
              </div>

              {/* Transcript */}
              {video.transcript && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Расшифровка
                  </h2>
                  <div className="prose max-w-none text-gray-600">
                    <p className="whitespace-pre-line">{video.transcript}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Теги</h3>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Поделиться
              </h3>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Share2 className="w-4 h-4 mr-2" />
                Поделиться видео
              </button>
            </div>

            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Похожие видео
                </h3>
                <div className="space-y-4">
                  {relatedVideos.map((related) => (
                    <Link
                      key={related.id}
                      href={`/videos/doctors-explain/${related.slug}`}
                      className="block group"
                    >
                      <div className="flex space-x-3">
                        <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={related.thumbnailUrl}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-teal-600">
                            {related.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {related.doctorName}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
