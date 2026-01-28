'use client'

import Link from 'next/link'
import { FileVideo, ExternalLink, Eye, Clock } from 'lucide-react'

interface Video {
  id: string
  title: string
  slug: string
  content_type: 'podcast' | 'eva_explains' | 'doctors_explain'
  video_type: string
  thumbnail_url: string
  duration: number
  category: string
  category_name: string
  access_level: string
  published: boolean
  published_at: string | null
  views_count: number
  created_at: string
  podcast_series?: string | null
  guest_expert_name?: string | null
  topic?: string | null
  doctor_name?: string | null
  doctor_specialty?: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface VideoContentTableProps {
  videos: Video[]
  pagination: Pagination
  onPageChange: (page: number) => void
  loading: boolean
}

export default function VideoContentTable({
  videos,
  pagination,
  onPageChange,
  loading
}: VideoContentTableProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    } catch {
      return '—'
    }
  }

  const contentTypeLabels: Record<string, string> = {
    podcast: 'Подкаст',
    eva_explains: 'Ева объясняет',
    doctors_explain: 'Врачи объясняют',
  }

  const contentTypeColors: Record<string, string> = {
    podcast: 'bg-purple-100 text-purple-800',
    eva_explains: 'bg-pink-100 text-pink-800',
    doctors_explain: 'bg-teal-100 text-teal-800',
  }

  const accessLevelColors: Record<string, string> = {
    free: 'bg-green-100 text-green-800',
    paid1: 'bg-orange-100 text-orange-800',
    paid2: 'bg-red-100 text-red-800',
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

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <FileVideo className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Нет видео</h3>
        <p className="mt-1 text-sm text-gray-500">
          Начните с создания нового видео контента
        </p>
        <div className="mt-6">
          <Link
            href="/admin/videos/create"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            Создать видео
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Видео
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тип / Автор
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Просмотры
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-24 relative rounded overflow-hidden bg-gray-100">
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <FileVideo className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 max-w-xs">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {video.title}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contentTypeColors[video.content_type] || 'bg-gray-100 text-gray-800'}`}>
                      {contentTypeLabels[video.content_type] || video.content_type}
                    </span>
                    {video.content_type === 'podcast' && video.guest_expert_name && (
                      <div className="text-xs text-gray-500 mt-1">{video.guest_expert_name}</div>
                    )}
                    {video.content_type === 'doctors_explain' && video.doctor_name && (
                      <div className="text-xs text-gray-500 mt-1">
                        {video.doctor_name}
                        {video.doctor_specialty && ` • ${video.doctor_specialty}`}
                      </div>
                    )}
                    {video.content_type === 'eva_explains' && video.topic && (
                      <div className="text-xs text-gray-500 mt-1">{video.topic}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{video.category_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {video.published ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Опубликовано
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Черновик
                        </span>
                      )}
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${accessLevelColors[video.access_level] || 'bg-gray-100 text-gray-800'}`}>
                          {video.access_level === 'free' ? 'Бесплатно' : video.access_level.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Eye className="h-4 w-4 mr-1 text-gray-400" />
                      {video.views_count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(video.published_at || video.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/videos/${video.id}`}
                      className="text-purple-600 hover:text-purple-900 inline-flex items-center"
                    >
                      Редактировать
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Назад
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Вперед
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Показано <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> -{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                из <span className="font-medium">{pagination.total}</span> видео
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Назад
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pagination.page
                        ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Вперед
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
