'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { OrdersTable } from '@/components/admin/OrdersTable'

interface Order {
  id: string
  order_number: string
  email: string
  name: string
  phone: string | null
  book_type: 'digital' | 'physical'
  amount_kopecks: number
  status: 'pending' | 'paid' | 'shipped' | 'cancelled' | 'refunded'
  created_at: string
  paid_at: string | null
  shipped_at: string | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

function OrdersPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [orders, setOrders] = useState<Order[]>([])
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
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [bookTypeFilter, setBookTypeFilter] = useState(searchParams.get('bookType') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  // Debounce поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Загрузка заказов
  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.set('page', pagination.page.toString())
    params.set('limit', pagination.limit.toString())

    if (debouncedSearch) params.set('search', debouncedSearch)
    if (statusFilter) params.set('status', statusFilter)
    if (bookTypeFilter) params.set('bookType', bookTypeFilter)

    try {
      const response = await fetch(`/api/admin/orders?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Ошибка загрузки заказов')
      }

      const data = await response.json()
      setOrders(data.orders || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error('Error loading orders:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, debouncedSearch, statusFilter, bookTypeFilter])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Обновление URL параметров
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (statusFilter) params.set('status', statusFilter)
    if (bookTypeFilter) params.set('bookType', bookTypeFilter)

    const newUrl = params.toString() ? `/admin/orders?${params.toString()}` : '/admin/orders'
    router.replace(newUrl)
  }, [debouncedSearch, statusFilter, bookTypeFilter, router])

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleBookTypeFilterChange = (value: string) => {
    setBookTypeFilter(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Заказы книг</h1>
        <p className="text-gray-600 mt-2">Управление заказами книг</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по номеру, email, имени, телефону..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Фильтр по статусу */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Все статусы</option>
              <option value="pending">Ожидает оплаты</option>
              <option value="paid">Оплачен</option>
              <option value="shipped">Отправлен</option>
              <option value="cancelled">Отменен</option>
              <option value="refunded">Возврат</option>
            </select>
          </div>

          {/* Фильтр по типу книги */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={bookTypeFilter}
              onChange={(e) => handleBookTypeFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Все типы</option>
              <option value="digital">Цифровая</option>
              <option value="physical">Печатная</option>
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

      {/* Таблица заказов */}
      <OrdersTable
        orders={orders}
        pagination={pagination}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Заказы книг</h1>
          <p className="text-gray-600 mt-2">Загрузка...</p>
        </div>
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  )
}
