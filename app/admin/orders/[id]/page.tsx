'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
} from 'lucide-react'
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge'
import { formatAmount, formatDate, formatBookType } from '@/lib/admin/formatters'

interface Order {
  id: string
  order_number: string
  email: string
  name: string
  phone: string | null
  user_id: number | null
  book_type: string
  amount_kopecks: number
  yookassa_payment_id: string | null
  status: string
  shipping_address: any | null
  bonus_activated: boolean
  download_token: string | null
  created_at: string
  paid_at: string | null
  shipped_at: string | null
  cancelled_at: string | null
  updated_at: string
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [params.id])

  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`)

      if (!response.ok) {
        throw new Error('Заказ не найден')
      }

      const data = await response.json()
      setOrder(data.order)
    } catch (err) {
      console.error('Error loading order:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!order) return

    const confirmMessage = `Изменить статус заказа на "${newStatus}"?`
    if (!confirm(confirmMessage)) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Ошибка обновления статуса')
      }

      const data = await response.json()
      setOrder(data.order)
      alert('Статус успешно обновлен')
    } catch (err) {
      console.error('Error updating status:', err)
      alert(err instanceof Error ? err.message : 'Ошибка обновления статуса')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка заказа...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-purple-600 hover:text-purple-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error || 'Заказ не найден'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-purple-600 hover:text-purple-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Заказ {order.order_number}</h1>
            <p className="text-gray-600 mt-2">
              Создан {formatDate(order.created_at)}
            </p>
          </div>
          <OrderStatusBadge status={order.status as any} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Информация о заказе */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация о заказе</h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Номер заказа</dt>
                <dd className="mt-1 text-sm text-gray-900">{order.order_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Дата создания</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(order.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Тип книги</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.book_type === 'digital'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {formatBookType(order.book_type)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Сумма</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">
                  {formatAmount(order.amount_kopecks)}
                </dd>
              </div>
              {order.yookassa_payment_id && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">ID платежа YooKassa</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {order.yookassa_payment_id}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Информация о клиенте */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация о клиенте</h2>
            <dl className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Имя</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.name}</dd>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{order.email}</dd>
                </div>
              </div>
              {order.phone && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Телефон</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.phone}</dd>
                  </div>
                </div>
              )}
              {order.user_id && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Пользователь</dt>
                  <dd className="mt-1">
                    <Link
                      href={`/admin/users/${order.user_id}`}
                      className="text-sm text-purple-600 hover:text-purple-900"
                    >
                      Перейти к профилю →
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Адрес доставки */}
          {order.shipping_address && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Адрес доставки
              </h2>
              <div className="text-sm text-gray-900 space-y-1">
                {order.shipping_address.country && <p>{order.shipping_address.country}</p>}
                {order.shipping_address.city && <p>{order.shipping_address.city}</p>}
                {order.shipping_address.street && <p>{order.shipping_address.street}</p>}
                {order.shipping_address.zip && <p>Индекс: {order.shipping_address.zip}</p>}
              </div>
            </div>
          )}

          {/* История статусов */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">История статусов</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Создан</p>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                </div>
              </div>

              {order.paid_at && (
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Оплачен</p>
                    <p className="text-sm text-gray-500">{formatDate(order.paid_at)}</p>
                  </div>
                </div>
              )}

              {order.shipped_at && (
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-cyan-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Отправлен</p>
                    <p className="text-sm text-gray-500">{formatDate(order.shipped_at)}</p>
                  </div>
                </div>
              )}

              {order.cancelled_at && (
                <div className="flex items-start">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Отменен</p>
                    <p className="text-sm text-gray-500">{formatDate(order.cancelled_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Действия (1/3) */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Действия</h2>
            <div className="space-y-3">
              {order.status === 'pending' && (
                <button
                  onClick={() => updateStatus('paid')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Отметить как оплачен
                </button>
              )}

              {order.status === 'paid' && (
                <button
                  onClick={() => updateStatus('shipped')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Truck className="h-4 w-4" />
                  Отметить как отправлен
                </button>
              )}

              {order.status !== 'cancelled' && order.status !== 'refunded' && (
                <button
                  onClick={() => updateStatus('cancelled')}
                  disabled={updating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="h-4 w-4" />
                  Отменить заказ
                </button>
              )}
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Дополнительно</h2>
            <dl className="space-y-3 text-sm">
              {order.bonus_activated && (
                <div>
                  <dt className="font-medium text-gray-500">Бонус активирован</dt>
                  <dd className="mt-1 text-gray-900">Да (Paid1)</dd>
                </div>
              )}
              {order.download_token && (
                <div>
                  <dt className="font-medium text-gray-500">Токен загрузки</dt>
                  <dd className="mt-1 text-gray-900 font-mono text-xs break-all">
                    {order.download_token}
                  </dd>
                </div>
              )}
              <div>
                <dt className="font-medium text-gray-500">Последнее обновление</dt>
                <dd className="mt-1 text-gray-900">{formatDate(order.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
