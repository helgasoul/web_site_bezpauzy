import { Metadata } from 'next'
import { getPublishedVideos } from '@/lib/video/get-videos'
import Link from 'next/link'
import { Play, Clock, Eye } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Врачи Объясняют | Без|Паузы',
  description: 'Экспертные видео от ведущих врачей о женском здоровье, менопаузе и здоровом образе жизни',
}

export default async function DoctorsExplainPage() {
  const videos = await getPublishedVideos({
    contentType: 'doctors_explain',
  })

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}ч ${minutes}мин`
    }
    return `${minutes} мин`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Врачи <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Объясняют</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Профессиональные советы и рекомендации от ведущих специалистов
            по вопросам женского здоровья, менопаузы и качества жизни
          </p>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Видео скоро появятся</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos/doctors-explain/${video.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white rounded-full p-4">
                        <Play className="w-8 h-8 text-teal-600" fill="currentColor" />
                      </div>
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(video.duration)}
                    </div>
                    {/* Access Level Badge */}
                    {video.accessLevel !== 'free' && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                        {video.accessLevel === 'paid1' ? 'Paid1' : 'Paid2'}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Category */}
                    <div className="text-xs font-medium text-teal-600 mb-2 uppercase tracking-wider">
                      {video.categoryName}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {video.title}
                    </h3>

                    {/* Doctor Info */}
                    <div className="flex items-center space-x-3 mb-3">
                      {video.doctorAvatar ? (
                        <img
                          src={video.doctorAvatar}
                          alt={video.doctorName || 'Doctor'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
                          {video.doctorName?.charAt(0) || 'D'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {video.doctorName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {video.doctorSpecialty}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {video.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {video.viewsCount || 0} просмотров
                      </div>
                      {video.publishedAt && (
                        <div className="text-xs">
                          {new Date(video.publishedAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
