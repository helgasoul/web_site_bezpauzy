import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { PlayCircle, Clock, Eye, User, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { assetUrl } from '@/lib/assets'

interface DoctorVideo {
  id: number
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  doctor_name: string
  doctor_specialty: string | null
  duration_minutes: number | null
  view_count: number
  created_at: string
  tags: string[]
}

async function getDoctorVideos(): Promise<DoctorVideo[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('menohub_video_content')
    .select('*')
    .eq('content_type', 'doctors_explain')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[DoctorsExplain] Error fetching videos:', error)
    return []
  }

  return data || []
}

function VideoCard({ video }: { video: DoctorVideo }) {
  return (
    <Link
      href={`/doctors-explain/${video.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-video bg-gradient-to-br from-primary-purple/10 to-ocean-wave-start/10 overflow-hidden">
        {video.thumbnail_url ? (
          <Image
            src={assetUrl(video.thumbnail_url)}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="w-20 h-20 text-primary-purple/30" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
            <PlayCircle className="w-10 h-10 text-primary-purple" />
          </div>
        </div>

        {video.duration_minutes && (
          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              {video.duration_minutes} мин
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-deep-navy/70" />
          <span className="text-sm font-medium text-deep-navy">
            {video.view_count > 1000 
              ? `${(video.view_count / 1000).toFixed(1)}k` 
              : video.view_count}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-deep-navy truncate">
              {video.doctor_name}
            </p>
            {video.doctor_specialty && (
              <p className="text-sm text-deep-navy/60 truncate">
                {video.doctor_specialty}
              </p>
            )}
          </div>
        </div>

        <h3 className="font-bold text-lg text-deep-navy mb-2 line-clamp-2 group-hover:text-primary-purple transition-colors">
          {video.title}
        </h3>

        {video.description && (
          <p className="text-sm text-deep-navy/70 line-clamp-2 mb-3">
            {video.description}
          </p>
        )}

        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {video.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-lavender-bg text-primary-purple text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

function VideoSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
      <div className="aspect-video bg-lavender-bg" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lavender-bg rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-lavender-bg rounded w-3/4" />
            <div className="h-3 bg-lavender-bg rounded w-1/2" />
          </div>
        </div>
        <div className="h-5 bg-lavender-bg rounded w-full" />
        <div className="h-4 bg-lavender-bg rounded w-full" />
        <div className="flex gap-2">
          <div className="h-6 bg-lavender-bg rounded-full w-20" />
          <div className="h-6 bg-lavender-bg rounded-full w-24" />
        </div>
      </div>
    </div>
  )
}

async function VideoGrid() {
  const videos = await getDoctorVideos()

  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-lavender-bg rounded-full flex items-center justify-center mx-auto mb-6">
          <PlayCircle className="w-10 h-10 text-primary-purple" />
        </div>
        <h3 className="text-2xl font-bold text-deep-navy mb-3">
          Скоро здесь появятся видео
        </h3>
        <p className="text-deep-navy/70 max-w-md mx-auto">
          Мы работаем над созданием полезного видеоконтента от проверенных врачей
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}

export default function DoctorsExplainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-bg via-white to-lavender-bg">
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-purple/10 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-primary-purple" />
            <span className="text-sm font-medium text-primary-purple">
              Видео от экспертов
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-deep-navy mb-6">
            Врачи объясняют
          </h1>
          
          <p className="text-xl text-deep-navy/70 max-w-3xl mx-auto mb-8">
            Видео уроки от врачей, которым я доверяю. Пополняемая база экспертного контента
            о менопаузе, здоровье и благополучии женщин.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-purple mb-1">
                <Suspense fallback="...">
                </Suspense>
              </div>
              <div className="text-sm text-deep-navy/60">Видео уроков</div>
            </div>
            <div className="w-px h-12 bg-deep-navy/10" />
            <div>
              <div className="text-3xl font-bold text-primary-purple mb-1">10+</div>
              <div className="text-sm text-deep-navy/60">Проверенных врачей</div>
            </div>
            <div className="w-px h-12 bg-deep-navy/10" />
            <div>
              <div className="text-3xl font-bold text-primary-purple mb-1">20+</div>
              <div className="text-sm text-deep-navy/60">Тем о здоровье</div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <VideoSkeleton key={i} />
                ))}
              </div>
            }
          >
            <VideoGrid />
          </Suspense>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-purple to-ocean-wave-start">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Получите полный доступ ко всем видео
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Оформите подписку и получите неограниченный доступ к видео урокам, консультациям с Евой и экспертным рекомендациям
          </p>
          <Link
            href="/payment/subscribe"
            className="inline-flex items-center gap-2 bg-white text-primary-purple px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <span>Оформить подписку</span>
            <Sparkles className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export const dynamic = 'force-dynamic'
