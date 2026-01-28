'use client'

import Link from 'next/link'
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import { SubscriberStatusBadge } from './SubscriberStatusBadge'
import { SubscriberSourceBadge } from './SubscriberSourceBadge'

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

interface SubscribersTableProps {
  subscribers: Subscriber[]
  pagination: Pagination
  onPageChange: (page: number) => void
  loading: boolean
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function SubscribersTable({ subscribers, pagination, onPageChange, loading }: SubscribersTableProps) {
  if (subscribers.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Подписчики не найдены</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Таблица */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Подписчик
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Источник
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата подписки
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Подтверждение
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Письмо
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {subscriber.email}
                      </div>
                      {subscriber.name && (
                        <div className="text-xs text-gray-500">{subscriber.name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SubscriberSourceBadge source={subscriber.source} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SubscriberStatusBadge status={subscriber.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(subscriber.subscribed_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {subscriber.confirmed_at ? (
                      <div title={formatDate(subscriber.confirmed_at)}>
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </div>
                    ) : (
                      <div title="Не подтвержден">
                        <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {subscriber.welcome_email_sent ? (
                      <div title="Отправлено">
                        <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                      </div>
                    ) : (
                      <div title="Не отправлено">
                        <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/subscribers/${subscriber.id}`}
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
      </div>

      {/* Пагинация */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            Показано {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Назад
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Вперед
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
