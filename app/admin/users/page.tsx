'use client'

import { useEffect, useState } from 'react'
import { UsersTable } from '@/components/admin/UsersTable'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface User {
  id: number
  telegram_id: number | null
  username: string | null
  is_subscribed: boolean | null
  subscription_plan: string | null
  payment_status: string | null
  created_at: string
  last_activity_at: string | null
  query_count_total: number
  age_range: string | null
  city: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Загрузка пользователей
  useEffect(() => {
    loadUsers()
  }, [pagination.page, debouncedSearch, subscriptionFilter])

  const loadUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(subscriptionFilter && { subscription: subscriptionFilter }),
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки пользователей')
      }

      setUsers(data.users || [])
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
        <p className="text-gray-600 mt-2">Управление пользователями платформы</p>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Поиск */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Поиск по email, username, telegram_id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Фильтр по подписке */}
          <div className="sm:w-48">
            <select
              value={subscriptionFilter}
              onChange={(e) => {
                setSubscriptionFilter(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Все подписки</option>
              <option value="free">Free</option>
              <option value="paid1">Paid1</option>
              <option value="paid2">Paid2</option>
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

      {/* Таблица пользователей */}
      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка пользователей...</p>
          </div>
        </div>
      ) : (
        <UsersTable
          users={users}
          pagination={pagination}
          onPageChange={handlePageChange}
          loading={loading}
        />
      )}
    </div>
  )
}
