'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Filter, Plus } from 'lucide-react'
import { BlogPostsTable } from '@/components/admin/BlogPostsTable'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  category_name: string
  author_name: string
  author_role: string
  image: string
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  read_time: number | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

function BlogPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [posts, setPosts] = useState<BlogPost[]>([])
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
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '')
  const [publishedFilter, setPublishedFilter] = useState(searchParams.get('published') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  // Debounce поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Загрузка статей
  const loadPosts = useCallback(async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.set('page', pagination.page.toString())
    params.set('limit', pagination.limit.toString())

    if (debouncedSearch) params.set('search', debouncedSearch)
    if (categoryFilter) params.set('category', categoryFilter)
    if (publishedFilter) params.set('published', publishedFilter)

    try {
      const response = await fetch(`/api/admin/blog?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Ошибка загрузки статей')
      }

      const data = await response.json()
      setPosts(data.posts || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error loading posts:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, debouncedSearch, categoryFilter, publishedFilter])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  // Обновление URL параметров
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (categoryFilter) params.set('category', categoryFilter)
    if (publishedFilter) params.set('published', publishedFilter)

    const newUrl = params.toString() ? `/admin/blog?${params.toString()}` : '/admin/blog'
    router.replace(newUrl)
  }, [debouncedSearch, categoryFilter, publishedFilter, router])

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
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
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Ошибка удаления статьи')
      }

      alert('Статья успешно удалена')
      loadPosts()
    } catch (err) {
      console.error('Error deleting post:', err)
      alert(err instanceof Error ? err.message : 'Ошибка удаления статьи')
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Блог</h1>
          <p className="text-gray-600 mt-2">Управление статьями блога</p>
        </div>
        <Link
          href="/admin/blog/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" />
          Создать статью
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
              placeholder="Поиск по названию, описанию, автору..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Фильтр по категории */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Все категории</option>
              <option value="gynecologist">Кабинет гинеколога</option>
              <option value="mammologist">Кабинет маммолога</option>
              <option value="nutritionist">Кухня нутрициолога</option>
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

      {/* Таблица статей */}
      <BlogPostsTable
        posts={posts}
        pagination={pagination}
        onPageChange={handlePageChange}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Блог</h1>
            <p className="text-gray-600 mt-2">Загрузка...</p>
          </div>
        </div>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  )
}
