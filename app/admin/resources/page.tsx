'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, Plus } from 'lucide-react'
import { ResourcesTable } from '@/components/admin/ResourcesTable'

interface Resource {
  id: string
  resource_type: 'checklist' | 'guide'
  title: string
  slug: string
  description: string
  icon_name: string | null
  cover_image: string | null
  pdf_source: string
  pdf_file_path: string
  pdf_filename: string
  category: string | null
  published: boolean
  coming_soon: boolean
  download_count: number
  view_count: number
  order_index: number
  created_at: string
  updated_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

function ResourcesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [resources, setResources] = useState<Resource[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Фильтры
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [resourceTypeFilter, setResourceTypeFilter] = useState(searchParams.get('resourceType') || '')
  const [publishedFilter, setPublishedFilter] = useState(searchParams.get('published') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  // Debounce поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Загрузка ресурсов
  const loadResources = useCallback(async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.set('page', pagination.page.toString())
    params.set('limit', pagination.limit.toString())

    if (debouncedSearch) params.set('search', debouncedSearch)
    if (resourceTypeFilter) params.set('resourceType', resourceTypeFilter)
    if (publishedFilter) params.set('published', publishedFilter)

    try {
      const response = await fetch(`/api/admin/resources?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Ошибка загрузки ресурсов')
      }

      const data = await response.json()
      setResources(data.resources || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error loading resources:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, debouncedSearch, resourceTypeFilter, publishedFilter])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  // Обновление URL параметров
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (resourceTypeFilter) params.set('resourceType', resourceTypeFilter)
    if (publishedFilter) params.set('published', publishedFilter)

    const newUrl = params.toString() ? `/admin/resources?${params.toString()}` : '/admin/resources'
    router.replace(newUrl)
  }, [debouncedSearch, resourceTypeFilter, publishedFilter, router])

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleResourceTypeFilterChange = (value: string) => {
    setResourceTypeFilter(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePublishedFilterChange = (value: string) => {
    setPublishedFilter(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/resources/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Ошибка удаления ресурса')
      }

      alert('Ресурс успешно удален')
      loadResources()
    } catch (err) {
      console.error('Error deleting resource:', err)
      alert(err instanceof Error ? err.message : 'Ошибка удаления ресурса')
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ресурсы</h1>
          <p className="text-gray-600 mt-2">Управление гайдами и чек-листами</p>
        </div>
        <Link
          href="/admin/resources/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" />
          Создать ресурс
        </Link>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, описанию..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Фильтр по типу */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={resourceTypeFilter}
              onChange={(e) => handleResourceTypeFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Все типы</option>
              <option value="checklist">Чек-листы</option>
              <option value="guide">Гайды</option>
            </select>
          </div>

          {/* Фильтр по статусу */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={publishedFilter}
              onChange={(e) => handlePublishedFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Все статусы</option>
              <option value="true">Опубликованные</option>
              <option value="false">Черновики</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Таблица ресурсов */}
      <ResourcesTable
        resources={resources}
        pagination={pagination}
        onPageChange={handlePageChange}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ресурсы</h1>
            <p className="text-gray-600 mt-2">Загрузка...</p>
          </div>
        </div>
      </div>
    }>
      <ResourcesPageContent />
    </Suspense>
  )
}
