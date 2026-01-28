'use client'

import { useEffect, useState } from 'react'
import { ContactSubmissionsTable } from '@/components/admin/ContactSubmissionsTable'
import { Search } from 'lucide-react'

interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  user_id: number | null
  page_url: string | null
  telegram_message_id: number | null
  created_at: string
  resolved_at: string | null
  updated_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ContactPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Load submissions when filters change
  useEffect(() => {
    loadSubmissions()
  }, [pagination.page, debouncedSearch, statusFilter])

  const loadSubmissions = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (debouncedSearch) params.append('search', debouncedSearch)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/contact?${params}`)

      if (!response.ok) {
        throw new Error('Ошибка загрузки обращений')
      }

      const data = await response.json()
      setSubmissions(data.submissions || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error loading contact submissions:', err)
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
  }, [statusFilter])

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Обратная связь</h1>
        <p className="text-gray-600 mt-2">Управление обращениями пользователей</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Email, имя, тема или сообщение..."
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
              <option value="new">Новое</option>
              <option value="in_progress">В работе</option>
              <option value="resolved">Решено</option>
              <option value="closed">Закрыто</option>
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
                Новых: <span className="font-medium text-blue-600">
                  {submissions.filter(s => s.status === 'new').length}
                </span>
              </div>
              <div>
                В работе: <span className="font-medium text-orange-600">
                  {submissions.filter(s => s.status === 'in_progress').length}
                </span>
              </div>
              <div>
                Решено: <span className="font-medium text-green-600">
                  {submissions.filter(s => s.status === 'resolved').length}
                </span>
              </div>
              <div>
                Закрыто: <span className="font-medium text-gray-600">
                  {submissions.filter(s => s.status === 'closed').length}
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

      {/* Таблица обращений */}
      <ContactSubmissionsTable
        submissions={submissions}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  )
}
