'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Activity, Package, MessageSquare, TestTube } from 'lucide-react'

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
  query_count_daily: number
  age_range: string | null
  city: string | null
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUser()
  }, [userId])

  const loadUser = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки пользователя')
      }

      setUser(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center text-purple-600 hover:text-purple-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к списку
        </Link>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error || 'Пользователь не найден'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/users"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад к списку
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Профиль пользователя</h1>
          <p className="text-gray-600 mt-2">ID: {user.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Основные данные */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Username</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.username || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Telegram ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.telegram_id || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Возраст</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.age_range || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Город</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.city || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Подписка</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {user.subscription_plan?.toUpperCase() || 'FREE'}
                  </span>
                  {user.is_subscribed && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Подписан
                    </span>
                  )}
                  {user.payment_status && (
                    <span className="ml-2 text-sm text-gray-600">
                      ({user.payment_status})
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Статистика активности */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Статистика активности
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Всего запросов</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {user.query_count_total || 0}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Запросов сегодня</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {user.query_count_daily || 0}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Дата регистрации
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(user.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Последняя активность</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(user.last_activity_at)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Быстрые действия */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                Изменить подписку
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                Заблокировать
              </button>
            </div>
          </div>

          {/* Связанные данные */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Связанные данные</h2>
            <div className="space-y-3">
              <Link
                href={`/admin/orders?userId=${user.id}`}
                className="flex items-center text-sm text-purple-600 hover:text-purple-900"
              >
                <Package className="h-4 w-4 mr-2" />
                Заказы
              </Link>
              <Link
                href={`/admin/chat?userId=${user.id}`}
                className="flex items-center text-sm text-purple-600 hover:text-purple-900"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                История чата
              </Link>
              <Link
                href={`/admin/tests?userId=${user.id}`}
                className="flex items-center text-sm text-purple-600 hover:text-purple-900"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Результаты тестов
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
