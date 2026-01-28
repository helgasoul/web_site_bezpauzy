'use client'

import Link from 'next/link'
import { Eye, Mail } from 'lucide-react'
import { ContactStatusBadge } from './ContactStatusBadge'

interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  user_id: number | null
  page_url: string | null
  telegram_message_id: number | null
  created_at: string
  resolved_at: string | null
  updated_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ContactSubmissionsTableProps {
  submissions: ContactSubmission[]
  pagination: Pagination
  onPageChange: (page: number) => void
  loading: boolean
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function ContactSubmissionsTable({ submissions, pagination, onPageChange, loading }: ContactSubmissionsTableProps) {
  if (submissions.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Обращения не найдены</p>
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
                  Отправитель
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тема
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сообщение
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {submission.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {submission.subject || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-md line-clamp-2">
                      {truncateText(submission.message, 100)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ContactStatusBadge status={submission.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(submission.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/contact/${submission.id}`}
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
