'use client'

import { useEffect, useState } from 'react'
import { AnalyticsMetricCard } from '@/components/admin/AnalyticsMetricCard'
import { AnalyticsTrendChart } from '@/components/admin/AnalyticsTrendChart'
import {
  Users,
  MessageSquare,
  Mail,
  ShoppingCart,
  DollarSign,
  HelpCircle,
  FileText,
  Calendar,
} from 'lucide-react'

interface OverviewMetrics {
  newUsers: number
  chatQueries: number
  newSubscribers: number
  bookOrders: number
  revenue: number
  supportRequests: number
  testsCompleted: number
}

interface Totals {
  totalUsers: number
  totalSubscribers: number
  totalOrders: number
  activeUsers: number
}

interface TrendData {
  users: Array<{ date: string; count: number }>
  queries: Array<{ date: string; count: number }>
  subscribers: Array<{ date: string; count: number }>
  orders: Array<{ date: string; count: number }>
  revenue: Array<{ date: string; amount: number }>
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null)
  const [totals, setTotals] = useState<Totals | null>(null)
  const [trends, setTrends] = useState<TrendData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Фильтры по датам
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    loadAnalytics()
  }, [dateRange, customStartDate, customEndDate])

  const getDateRange = () => {
    const end = new Date()
    let start = new Date()

    switch (dateRange) {
      case '7d':
        start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'custom':
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate)
          end.setTime(new Date(customEndDate).getTime())
        }
        break
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }
  }

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const { startDate, endDate } = getDateRange()
      const params = new URLSearchParams({ startDate, endDate })

      // Загружаем overview метрики
      const overviewResponse = await fetch(`/api/admin/analytics/overview?${params}`)
      if (!overviewResponse.ok) throw new Error('Ошибка загрузки метрик')
      const overviewData = await overviewResponse.json()

      // Загружаем тренды для графиков
      const trendsResponse = await fetch(`/api/admin/analytics/trends?${params}`)
      if (!trendsResponse.ok) throw new Error('Ошибка загрузки трендов')
      const trendsData = await trendsResponse.json()

      setMetrics(overviewData.metrics)
      setTotals(overviewData.totals)
      setTrends(trendsData.trends)
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка аналитики...</p>
        </div>
      </div>
    )
  }

  if (error || !metrics || !totals || !trends) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-red-800">{error || 'Ошибка загрузки данных'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
        <p className="text-gray-600 mt-2">Обзор ключевых метрик платформы</p>
      </div>

      {/* Фильтры по датам */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Период:</span>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d', 'custom'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  dateRange === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '7d' && '7 дней'}
                {range === '30d' && '30 дней'}
                {range === '90d' && '90 дней'}
                {range === 'custom' && 'Произвольный'}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="text-gray-500 self-center">—</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Ключевые метрики */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ключевые метрики за период</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsMetricCard
            title="Новые пользователи"
            value={metrics.newUsers}
            icon={Users}
            format="number"
          />
          <AnalyticsMetricCard
            title="Запросы в AI-чат"
            value={metrics.chatQueries}
            icon={MessageSquare}
            format="number"
          />
          <AnalyticsMetricCard
            title="Новые подписчики"
            value={metrics.newSubscribers}
            icon={Mail}
            format="number"
          />
          <AnalyticsMetricCard
            title="Заказы книг"
            value={metrics.bookOrders}
            icon={ShoppingCart}
            format="number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsMetricCard
          title="Выручка"
          value={metrics.revenue}
          icon={DollarSign}
          format="currency"
        />
        <AnalyticsMetricCard
          title="Обращения в поддержку"
          value={metrics.supportRequests}
          icon={HelpCircle}
          format="number"
        />
        <AnalyticsMetricCard
          title="Пройдено тестов"
          value={metrics.testsCompleted}
          icon={FileText}
          format="number"
        />
      </div>

      {/* Общая статистика */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Общая статистика</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totals.totalUsers.toLocaleString('ru-RU')}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Активных пользователей (7 дней)</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totals.activeUsers.toLocaleString('ru-RU')}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Всего подписчиков</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totals.totalSubscribers.toLocaleString('ru-RU')}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Всего заказов</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totals.totalOrders.toLocaleString('ru-RU')}</p>
          </div>
        </div>
      </div>

      {/* Графики трендов */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Динамика</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsTrendChart
            data={trends.users}
            dataKey="count"
            title="Новые пользователи"
            color="#9333ea"
          />
          <AnalyticsTrendChart
            data={trends.queries}
            dataKey="count"
            title="Запросы в AI-чат"
            color="#06b6d4"
          />
          <AnalyticsTrendChart
            data={trends.subscribers}
            dataKey="count"
            title="Новые подписчики"
            color="#10b981"
          />
          <AnalyticsTrendChart
            data={trends.orders}
            dataKey="count"
            title="Заказы книг"
            color="#f59e0b"
          />
        </div>
      </div>

      {/* График выручки */}
      <AnalyticsTrendChart
        data={trends.revenue}
        dataKey="amount"
        title="Выручка"
        color="#8b5cf6"
        format="currency"
      />
    </div>
  )
}
