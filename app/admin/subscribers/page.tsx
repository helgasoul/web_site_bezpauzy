'use client'

import { useEffect, useState } from 'react'
import { SubscribersTable } from '@/components/admin/SubscribersTable'
import { Search } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  name: string | null
  subscribed_at: string
  source: string | null
  status: 'pending' | 'active' | 'unsubscribed'
  confirmed_at: string | null
  unsubscribed_at: string | null
  welcome_email_sent: boolean
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Load subscribers when filters change
  useEffect(() => {
    loadSubscribers()
  }, [pagination.page, debouncedSearch, statusFilter, sourceFilter])

  const loadSubscribers = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (debouncedSearch) params.append('search', debouncedSearch)
      if (statusFilter) params.append('status', statusFilter)
      if (sourceFilter) params.append('source', sourceFilter)

      const response = await fetch(`/api/admin/subscribers?${params}`)

      if (!response.ok) {
        throw new Error('Ошибка загрузки подписчиков')
      }

      const data = await response.json()
      setSubscribers(data.subscribers || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error loading subscribers:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleFilterChange = () => {
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  useEffect(() => {
    handleFilterChange()
  }, [statusFilter, sourceFilter])

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Подписчики рассылки</h1>
        <p className="text-gray-600 mt-2">Управление email-подписками на новости</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Поиск */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Email или имя..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Фильтр по статусу */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Все статусы</option>
              <option value="pending">Ожидает подтверждения</option>
              <option value="active">Активен</option>
              <option value="unsubscribed">Отписан</option>
            </select>
          </div>

          {/* Фильтр по источнику */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Источник
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Все источники</option>
              <option value="homepage">Главная</option>
              <option value="blog">Блог</option>
              <option value="book_page">Страница книги</option>
              <option value="newsletter_page">Страница рассылки</option>
            </select>
          </div>
        </div>

        {/* Статистика */}
        {!loading && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div>
                Всего: <span className="font-medium text-gray-900">{pagination.total}</span>
              </div>
              <div>
                Активных: <span className="font-medium text-green-600">
                  {subscribers.filter(s => s.status === 'active').length}
                </span>
              </div>
              <div>
                Ожидают: <span className="font-medium text-orange-600">
                  {subscribers.filter(s => s.status === 'pending').length}
                </span>
              </div>
              <div>
                Отписаны: <span className="font-medium text-gray-600">
                  {subscribers.filter(s => s.status === 'unsubscribed').length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ошибка */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Таблица подписчиков */}
      <SubscribersTable
        subscribers={subscribers}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  )
}
