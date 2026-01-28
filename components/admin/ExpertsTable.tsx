'use client'

import Link from 'next/link'
import { Edit } from 'lucide-react'

interface Expert {
  id: string
  category: string
  category_name: string
  name: string
  specialization: string
  role: string
  description: string
  image: string | null
  cv: string | null
  bio: string | null
  bot_command: string | null
  telegram_bot_link: string | null
  order_index: number
  created_at: string
  updated_at: string
}

interface ExpertsTableProps {
  experts: Expert[]
  loading: boolean
}

const categoryColors: Record<string, string> = {
  gynecologist: 'bg-pink-100 text-pink-800',
  mammologist: 'bg-purple-100 text-purple-800',
  nutritionist: 'bg-green-100 text-green-800',
}

export function ExpertsTable({ experts, loading }: ExpertsTableProps) {
  if (experts.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Эксперты не найдены</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Эксперт
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Категория
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Специализация
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Описание
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {experts.map((expert) => (
              <tr key={expert.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {expert.image ? (
                      <img
                        src={expert.image}
                        alt={expert.name}
                        className="w-12 h-12 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-gray-500 font-medium text-lg">
                          {expert.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {expert.name}
                      </div>
                      <div className="text-xs text-gray-500">{expert.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      categoryColors[expert.category] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {expert.category_name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {expert.specialization}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 line-clamp-2 max-w-md">
                    {expert.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/doctors/${expert.id}`}
                    className="inline-flex items-center text-purple-600 hover:text-purple-900"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Редактировать
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
