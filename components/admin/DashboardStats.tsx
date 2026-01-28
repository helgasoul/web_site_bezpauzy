'use client'

import { Users, ShoppingCart, Mail, MessageSquare, TrendingUp } from 'lucide-react'

interface DashboardStatsProps {
  newUsersToday: number
  newUsersWeek: number
  newOrdersToday: number
  newOrdersWeek: number
  newSubscribersToday: number
  newSubscribersWeek: number
  newChatQueriesToday: number
  newChatQueriesWeek: number
}

export function DashboardStats({
  newUsersToday,
  newUsersWeek,
  newOrdersToday,
  newOrdersWeek,
  newSubscribersToday,
  newSubscribersWeek,
  newChatQueriesToday,
  newChatQueriesWeek,
}: DashboardStatsProps) {
  const stats = [
    {
      title: 'Новые пользователи',
      today: newUsersToday,
      week: newUsersWeek,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Новые заказы',
      today: newOrdersToday,
      week: newOrdersWeek,
      icon: ShoppingCart,
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      title: 'Новые подписчики',
      today: newSubscribersToday,
      week: newSubscribersWeek,
      icon: Mail,
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Запросы в чат',
      today: newChatQueriesToday,
      week: newChatQueriesWeek,
      icon: MessageSquare,
      color: 'from-indigo-500 to-indigo-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const growth = stat.week > 0 ? ((stat.today / stat.week) * 100).toFixed(0) : 0

        return (
          <div
            key={stat.title}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.today}</p>
                {stat.week > 0 && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    <span>+{growth}% за неделю</span>
                  </div>
                )}
              </div>
              <div className={`rounded-lg bg-gradient-to-br ${stat.color} p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
