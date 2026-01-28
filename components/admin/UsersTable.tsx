'use client'

import Link from 'next/link'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface UsersTableProps {
  users: User[]
  pagination: Pagination
  onPageChange: (page: number) => void
  loading: boolean
}

const subscriptionPlanLabels: Record<string, string> = {
  free: 'Free',
  paid1: 'Paid1',
  paid2: 'Paid2',
}

const paymentStatusLabels: Record<string, string> = {
  active: 'Активна',
  pending: 'Ожидает',
  expired: 'Истекла',
  cancelled: 'Отменена',
}

const paymentStatusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-orange-100 text-orange-800',
  expired: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export function UsersTable({ users, pagination, onPageChange, loading }: UsersTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${day}.${month}.${year} ${hours}:${minutes}`
    } catch {
      return '—'
    }
  }

  if (users.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Пользователи не найдены</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Пользователь
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Подписка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Запросов
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Регистрация
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Последняя активность
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {user.username || `Telegram: ${user.telegram_id || '—'}`}
                    </div>
                    {user.telegram_id && (
                      <div className="text-gray-500 text-xs">TG ID: {user.telegram_id}</div>
                    )}
                    {user.age_range && (
                      <div className="text-gray-500 text-xs">Возраст: {user.age_range}</div>
                    )}
                    {user.city && (
                      <div className="text-gray-500 text-xs">Город: {user.city}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-900">
                      {subscriptionPlanLabels[user.subscription_plan || 'free'] || 'Free'}
                    </span>
                    {user.is_subscribed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Подписан
                      </span>
                    )}
                    {user.payment_status && (
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                          paymentStatusColors[user.payment_status] ||
                            paymentStatusColors.cancelled
                        )}
                      >
                        {paymentStatusLabels[user.payment_status] || user.payment_status}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.query_count_total || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.last_activity_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="inline-flex items-center text-purple-600 hover:text-purple-900"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Просмотр
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      {pagination.totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Показано {((pagination.page - 1) * pagination.limit) + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={cn(
                'p-2 rounded-md border border-gray-300',
                pagination.page === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700">
              Страница {pagination.page} из {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className={cn(
                'p-2 rounded-md border border-gray-300',
                pagination.page >= pagination.totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
