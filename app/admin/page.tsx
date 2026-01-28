'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, FileText, Users, Mail } from 'lucide-react'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { DashboardCharts } from '@/components/admin/DashboardCharts'

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    newUsersToday: 0,
    newUsersWeek: 0,
    newOrdersToday: 0,
    newOrdersWeek: 0,
    newSubscribersToday: 0,
    newSubscribersWeek: 0,
    newChatQueriesToday: 0,
    newChatQueriesWeek: 0,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Загружаем статистику
    fetch('/api/admin/stats')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка загрузки статистики')
        }
        return res.json()
      })
      .then((data) => {
        setStats({
          newUsersToday: data.newUsersToday || 0,
          newUsersWeek: data.newUsersWeek || 0,
          newOrdersToday: data.newOrdersToday || 0,
          newOrdersWeek: data.newOrdersWeek || 0,
          newSubscribersToday: data.newSubscribersToday || 0,
          newSubscribersWeek: data.newSubscribersWeek || 0,
          newChatQueriesToday: data.newChatQueriesToday || 0,
          newChatQueriesWeek: data.newChatQueriesWeek || 0,
        })
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading stats:', err)
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка статистики...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-red-800">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Обзор платформы</p>
      </div>

      <DashboardStats
        newUsersToday={stats.newUsersToday}
        newUsersWeek={stats.newUsersWeek}
        newOrdersToday={stats.newOrdersToday}
        newOrdersWeek={stats.newOrdersWeek}
        newSubscribersToday={stats.newSubscribersToday}
        newSubscribersWeek={stats.newSubscribersWeek}
        newChatQueriesToday={stats.newChatQueriesToday}
        newChatQueriesWeek={stats.newChatQueriesWeek}
      />

      {/* Быстрые действия */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/orders?status=pending"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
          >
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Необработанные</div>
              <div className="text-xs text-gray-500">заказы</div>
            </div>
          </Link>

          <Link
            href="/admin/blog/create"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
          >
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Создать статью</div>
              <div className="text-xs text-gray-500">блога</div>
            </div>
          </Link>

          <Link
            href="/admin/users?sortBy=created_at"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
          >
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Users className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Новые</div>
              <div className="text-xs text-gray-500">пользователи</div>
            </div>
          </Link>

          <Link
            href="/admin/contact?status=new"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all"
          >
            <div className="p-2 bg-pink-100 rounded-lg">
              <Mail className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Обратная связь</div>
              <div className="text-xs text-gray-500">новые</div>
            </div>
          </Link>
        </div>
      </div>

      <DashboardCharts />
    </div>
  )
}
