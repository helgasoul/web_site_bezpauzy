'use client'

import { useEffect, useState } from 'react'
import { ExpertsTable } from '@/components/admin/ExpertsTable'

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

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadExperts()
  }, [])

  const loadExperts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/experts')

      if (!response.ok) {
        throw new Error('Ошибка загрузки экспертов')
      }

      const data = await response.json()
      setExperts(data.experts || [])
    } catch (err) {
      console.error('Error loading experts:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Эксперты</h1>
        <p className="text-gray-600 mt-2">Управление профилями врачей и специалистов</p>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Таблица экспертов */}
      <ExpertsTable experts={experts} loading={loading} />
    </div>
  )
}
