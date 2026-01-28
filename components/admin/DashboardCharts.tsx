'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface UserGrowthData {
  date: string
  users: number
}

interface OrderStatusData {
  name: string
  value: number
  color: string
}

interface WeeklyActivityData {
  day: string
  users: number
  orders: number
}

interface ChartsData {
  userGrowth: UserGrowthData[]
  orderStatuses: OrderStatusData[]
  weeklyActivity: WeeklyActivityData[]
}

export function DashboardCharts() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ChartsData>({
    userGrowth: [],
    orderStatuses: [],
    weeklyActivity: [],
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/charts')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ошибка загрузки данных графиков')
        }
        return res.json()
      })
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading charts:', err)
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm h-80 flex items-center justify-center"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ))}
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
    <div className="grid grid-cols-1 gap-6">
      {/* График роста пользователей */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Рост пользователей (последние 30 дней)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data.userGrowth}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#9333ea"
              fill="url(#colorUsers)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График статусов заказов */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Статусы заказов</h2>
          {data.orderStatuses.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.orderStatuses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.orderStatuses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">
              Нет данных о заказах
            </div>
          )}
        </div>

        {/* График активности за неделю */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Активность за неделю
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#9333ea"
                strokeWidth={2}
                name="Пользователи"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#06b6d4"
                strokeWidth={2}
                name="Заказы"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
