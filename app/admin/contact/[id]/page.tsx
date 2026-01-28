'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Calendar, Trash2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { ContactStatusBadge } from '@/components/admin/ContactStatusBadge'

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

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [submission, setSubmission] = useState<ContactSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadSubmission()
  }, [params.id])

  const loadSubmission = async () => {
    try {
      const response = await fetch(`/api/admin/contact/${params.id}`)

      if (!response.ok) {
        throw new Error('Обращение не найдено')
      }

      const data = await response.json()
      setSubmission(data.submission)
    } catch (err) {
      console.error('Error loading contact submission:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: 'new' | 'in_progress' | 'resolved' | 'closed') => {
    if (!submission) return

    const statusLabels = {
      new: 'Новое',
      in_progress: 'В работе',
      resolved: 'Решено',
      closed: 'Закрыто',
    }

    if (!confirm(`Изменить статус на "${statusLabels[newStatus]}"?`)) return

    setUpdating(true)

    try {
      const response = await fetch(`/api/admin/contact/${params.id}`, {
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
      setSubmission(data.submission)
      alert('Статус успешно обновлен')
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Ошибка при обновлении статуса')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить это обращение? Это действие необратимо.')) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/admin/contact/${params.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Ошибка удаления обращения')
      }

      alert('Обращение успешно удалено')
      router.push('/admin/contact')
    } catch (err) {
      console.error('Error deleting submission:', err)
      alert('Ошибка при удалении обращения')
      setDeleting(false)
    }
  }

  const handleCopyEmail = () => {
    if (submission?.email) {
      navigator.clipboard.writeText(submission.email)
      alert('Email скопирован в буфер обмена')
    }
  }

  const handleSendEmail = () => {
    if (submission) {
      const subject = submission.subject ? `Re: ${submission.subject}` : 'Re: Ваше обращение'
      window.location.href = `mailto:${submission.email}?subject=${encodeURIComponent(subject)}`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка обращения...</p>
        </div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div>
        <Link
          href="/admin/contact"
          className="inline-flex items-center text-purple-600 hover:text-purple-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error || 'Обращение не найдено'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <Link
          href="/admin/contact"
          className="inline-flex items-center text-purple-600 hover:text-purple-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Обращение от {submission.name}</h1>
            <p className="text-gray-600 mt-2">{submission.email}</p>
          </div>
          <ContactStatusBadge status={submission.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Информация об отправителе */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация об отправителе</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-500 w-32">Имя:</span>
                <span className="text-sm text-gray-900">{submission.name}</span>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-500 w-32">Email:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-900">{submission.email}</span>
                  <button
                    onClick={handleCopyEmail}
                    className="text-xs text-purple-600 hover:text-purple-900"
                  >
                    Копировать
                  </button>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-500 w-32">Телефон:</span>
                <span className="text-sm text-gray-900">{submission.phone || '—'}</span>
              </div>
              <div className="flex items-start">
                <span className="text-sm font-medium text-gray-500 w-32">Тема:</span>
                <span className="text-sm text-gray-900">{submission.subject || '—'}</span>
              </div>
              {submission.page_url && (
                <div className="flex items-start">
                  <span className="text-sm font-medium text-gray-500 w-32">Страница:</span>
                  <a href={submission.page_url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:text-purple-900 underline">
                    {submission.page_url}
                  </a>
                </div>
              )}
              {submission.user_id && (
                <div className="flex items-start">
                  <span className="text-sm font-medium text-gray-500 w-32">User ID:</span>
                  <Link href={`/admin/users/${submission.user_id}`} className="text-sm text-purple-600 hover:text-purple-900 underline">
                    {submission.user_id}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Сообщение */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Сообщение</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{submission.message}</p>
            </div>
          </div>

          {/* История */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">История</h2>
            <div className="space-y-4">
              {/* Создание */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Обращение создано</div>
                  <div className="text-xs text-gray-500">{formatDateTime(submission.created_at)}</div>
                </div>
              </div>

              {/* Решено */}
              {submission.resolved_at && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">Обращение решено</div>
                    <div className="text-xs text-gray-500">{formatDateTime(submission.resolved_at)}</div>
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
                <span className="text-gray-900 font-mono text-xs">{submission.id}</span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 w-48">Создан:</span>
                <span className="text-gray-900">{formatDateTime(submission.created_at)}</span>
              </div>
              <div className="flex items-start">
                <span className="text-gray-500 w-48">Обновлен:</span>
                <span className="text-gray-900">{formatDateTime(submission.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Действия</h2>
            <div className="space-y-3">
              {/* Ответить на email */}
              <button
                onClick={handleSendEmail}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                <Mail className="h-4 w-4" />
                Ответить на email
              </button>

              {/* Изменение статуса */}
              {submission.status === 'new' && (
                <>
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {updating ? 'Обновление...' : 'Взять в работу'}
                  </button>
                  <button
                    onClick={() => handleStatusChange('resolved')}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {updating ? 'Обновление...' : 'Отметить как решено'}
                  </button>
                </>
              )}

              {submission.status === 'in_progress' && (
                <button
                  onClick={() => handleStatusChange('resolved')}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {updating ? 'Обновление...' : 'Отметить как решено'}
                </button>
              )}

              {(submission.status === 'new' || submission.status === 'in_progress' || submission.status === 'resolved') && (
                <button
                  onClick={() => handleStatusChange('closed')}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {updating ? 'Обновление...' : 'Закрыть обращение'}
                </button>
              )}

              {submission.status === 'closed' && (
                <button
                  onClick={() => handleStatusChange('new')}
                  disabled={updating}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {updating ? 'Обновление...' : 'Открыть снова'}
                </button>
              )}

              {/* Разделитель */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Удаление */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Удаление...' : 'Удалить обращение'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
