'use client'

import Link from 'next/link'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAmount, formatDate, formatBookType } from '@/lib/admin/formatters'
import { OrderStatusBadge } from './OrderStatusBadge'

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

interface OrdersTableProps {
  orders: Order[]
  pagination: Pagination
  onPageChange: (page: number) => void
  loading: boolean
}

export function OrdersTable({ orders, pagination, onPageChange, loading }: OrdersTableProps) {
  if (orders.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Заказы не найдены</p>
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
                Номер заказа
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Клиент
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тип книги
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата создания
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {order.order_number}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{order.name}</div>
                    <div className="text-gray-500">{order.email}</div>
                    {order.phone && (
                      <div className="text-gray-500 text-xs">{order.phone}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      order.book_type === 'digital'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {formatBookType(order.book_type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatAmount(order.amount_kopecks)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/orders/${order.id}`}
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
