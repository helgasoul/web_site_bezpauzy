'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import VideoContentTable from '@/components/admin/VideoContentTable'

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

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [contentTypeFilter, setContentTypeFilter] = useState('')
  const [publishedFilter, setPublishedFilter] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Load videos
  useEffect(() => {
    loadVideos()
  }, [pagination.page, debouncedSearch, contentTypeFilter, publishedFilter])

  const loadVideos = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (debouncedSearch) params.append('search', debouncedSearch)
      if (contentTypeFilter) params.append('contentType', contentTypeFilter)
      if (publishedFilter) params.append('published', publishedFilter)

      const response = await fetch(`/api/admin/videos?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки видео')
      }

      setVideos(data.videos)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Видео контент</h1>
          <p className="text-gray-600 mt-2">
            Управление подкастами, роликами Евы и видео с врачами
          </p>
        </div>
        <Link
          href="/admin/videos/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Добавить видео
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Поиск
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Название, автор, тема..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Content Type Filter */}
          <div>
            <label htmlFor="content-type" className="block text-sm font-medium text-gray-700 mb-2">
              Тип контента
            </label>
            <select
              id="content-type"
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="">Все типы</option>
              <option value="podcast">Подкаст noPause</option>
              <option value="eva_explains">Ева объясняет</option>
              <option value="doctors_explain">Врачи объясняют</option>
            </select>
          </div>

          {/* Published Filter */}
          <div>
            <label htmlFor="published" className="block text-sm font-medium text-gray-700 mb-2">
              Статус публикации
            </label>
            <select
              id="published"
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
            >
              <option value="">Все</option>
              <option value="true">Опубликовано</option>
              <option value="false">Черновик</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-purple-900">
              Всего видео: <span className="font-bold">{pagination.total}</span>
            </div>
            {(debouncedSearch || contentTypeFilter || publishedFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setContentTypeFilter('')
                  setPublishedFilter('')
                }}
                className="text-sm text-purple-600 hover:text-purple-900 font-medium"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Table */}
      <VideoContentTable
        videos={videos}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  )
}
