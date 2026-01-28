'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle, Mail, Trash2, Clock } from 'lucide-react'
import Link from 'next/link'
import { SubscriberStatusBadge } from '@/components/admin/SubscriberStatusBadge'
import { SubscriberSourceBadge } from '@/components/admin/SubscriberSourceBadge'

interface Subscriber {
  id: string
  email: string
  name: string | null
  subscribed_at: string
  source: string | null
  status: 'pending' | 'active' | 'unsubscribed'
  unsubscribed_at: string | null
  confirmation_token: string | null
  confirmation_sent_at: string | null
  confirmed_at: string | null
  unsubscribe_token: string | null
  welcome_email_sent: boolean
  created_at: string
  updated_at: string
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SubscriberDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadSubscriber()
  }, [params.id])

  const loadSubscriber = async () => {
    try {
      const response = await fetch(`/api/admin/subscribers/${params.id}`)

      if (!response.ok) {
        throw new Error('Подписчик не найден')
      }

      const data = await response.json()
      setSubscriber(data.subscriber)
    } catch (err) {
      console.error('Error loading subscriber:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: 'pending' | 'active' | 'unsubscribed') => {
    if (!subscriber) return

    const confirmMessage =
      newStatus === 'unsubscribed'
        ? 'Вы уверены, что хотите отписать этого пользователя?'
        : `Изменить статус на "${newStatus === 'active' ? 'Активен' : 'Ожидает подтверждения'}"?`

    if (!confirm(confirmMessage)) return

    setUpdating(true)

    try {
      const response = await fetch(`/api/admin/subscribers/${params.id}`, {
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
      setSubscriber(data.subscriber)
      alert('Статус успешно обновлен')
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Ошибка при обновлении статуса')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этого подписчика? Это действие необратимо.')) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/admin/subscribers/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Ошибка удаления подписчика')
      }

      alert('Подписчик успешно удален')
      router.push('/admin/subscribers')
    } catch (err) {
      console.error('Error deleting subscriber:', err)
      alert('Ошибка при удалении подписчика')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка подписчика...</p>
        </div>
      </div>
    )
  }

  if (error || !subscriber) {
    return (
      <div>
        <Link
          href="/admin/subscribers"
          className="inline-flex items-center text-purple-600 hover:text-purple-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error || 'Подписчик не найден'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <Link
          href="/admin/subscribers"
          className="inline-flex items-center text-purple-600 hover:text-purple-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Детали подписчика</h1>
        <p className="text-gray-600 mt-2">{subscriber.email}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Контактная информация */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Контактная информация</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-500 w-32">Email:</span>
                <span className="text-sm text-gray-900">{subscriber.email}</span>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-500 w-32">Имя:</span>
                <span className="text-sm text-gray-900">{subscriber.name || '—'}</span>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-500 w-32">Источник:</span>
                <SubscriberSourceBadge source={subscriber.source} />
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-500 w-32">Статус:</span>
                <SubscriberStatusBadge status={subscriber.status} />
              </div>
            </div>
          </div>

          {/* История событий */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">История событий</h2>
            <div className="space-y-4">
              {/* Подписка */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Подписка создана</div>
                  <div className="text-xs text-gray-500">{formatDateTime(subscriber.subscribed_at)}</div>
                </div>
              </div>

              {/* Отправка подтверждения */}
              {subscriber.confirmation_sent_at && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Письмо подтверждения отправлено</div>
                    <div className="text-xs text-gray-500">{formatDateTime(subscriber.confirmation_sent_at)}</div>
                  </div>
                </div>
              )}

              {/* Подтверждение */}
              {subscriber.confirmed_at && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Подписка подтверждена</div>
                    <div className="text-xs text-gray-500">{formatDateTime(subscriber.confirmed_at)}</div>
                  </div>
                </div>
              )}

              {/* Приветственное письмо */}
              {subscriber.welcome_email_sent && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Приветственное письмо отправлено</div>
                  </div>
                </div>
              )}

              {/* Отписка */}
              {subscriber.unsubscribed_at && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Отписка</div>
                    <div className="text-xs text-gray-500">{formatDateTime(subscriber.unsubscribed_at)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Системная информация */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Системная информация</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <span className="text-gray-500 w-48">ID:</span>
                <span className="text-gray-900 font-mono text-xs">{subscriber.id}</span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 w-48">Создан:</span>
                <span className="text-gray-900">{formatDateTime(subscriber.created_at)}</span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 w-48">Обновлен:</span>
                <span className="text-gray-900">{formatDateTime(subscriber.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Действия</h2>
            <div className="space-y-3">
              {/* Изменение статуса */}
              {subscriber.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange('active')}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {updating ? 'Обновление...' : 'Активировать подписку'}
                </button>
              )}

              {subscriber.status === 'active' && (
                <button
                  onClick={() => handleStatusChange('unsubscribed')}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {updating ? 'Обновление...' : 'Отписать'}
                </button>
              )}

              {subscriber.status === 'unsubscribed' && (
                <button
                  onClick={() => handleStatusChange('active')}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {updating ? 'Обновление...' : 'Возобновить подписку'}
                </button>
              )}

              {/* Удаление */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Удаление...' : 'Удалить подписчика'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
