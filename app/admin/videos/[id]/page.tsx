'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import VideoContentForm from '@/components/admin/VideoContentForm'

export default function EditVideoPage() {
  const params = useParams()
  const videoId = params.id as string

  const [video, setVideo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadVideo()
  }, [videoId])

  const loadVideo = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки видео')
      }

      setVideo(data.video)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка видео...</p>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-red-800">{error || 'Видео не найдено'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <VideoContentForm
        mode="edit"
        initialData={{
          id: video.id,
          title: video.title,
          slug: video.slug,
          description: video.description,
          content_type: video.content_type,
          video_url: video.video_url,
          video_type: video.video_type,
          video_id: video.video_id || '',
          thumbnail_url: video.thumbnail_url,
          duration: video.duration || 0,
          category: video.category,
          category_name: video.category_name,
          access_level: video.access_level,
          published: video.published,
          tags: video.tags || [],
          meta_title: video.meta_title || '',
          meta_description: video.meta_description || '',
          // Podcast
          podcast_series: video.podcast_series,
          guest_expert_name: video.guest_expert_name,
          guest_expert_role: video.guest_expert_role,
          guest_expert_avatar: video.guest_expert_avatar,
          host_name: video.host_name,
          // Eva
          topic: video.topic,
          // Doctors
          doctor_name: video.doctor_name,
          doctor_specialty: video.doctor_specialty,
          doctor_credentials: video.doctor_credentials,
          doctor_avatar: video.doctor_avatar,
        }}
      />
    </div>
  )
}
