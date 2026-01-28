'use client'

import { useEffect, useState } from 'react'
import { ExpertEditor } from '@/components/admin/ExpertEditor'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditExpertPage({ params }: { params: { id: string } }) {
  const [expert, setExpert] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadExpert()
  }, [params.id])

  const loadExpert = async () => {
    try {
      const response = await fetch(`/api/admin/experts/${params.id}`)

      if (!response.ok) {
        throw new Error('Эксперт не найден')
      }

      const data = await response.json()
      setExpert(data.expert)
    } catch (err) {
      console.error('Error loading expert:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (expertData: any) => {
    const response = await fetch(`/api/admin/experts/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expertData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Ошибка обновления эксперта')
    }

    return response.json()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка эксперта...</p>
        </div>
      </div>
    )
  }

  if (error || !expert) {
    return (
      <div>
        <Link
          href="/admin/doctors"
          className="inline-flex items-center text-purple-600 hover:text-purple-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error || 'Эксперт не найден'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <Link
          href="/admin/doctors"
          className="inline-flex items-center text-purple-600 hover:text-purple-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Редактировать эксперта</h1>
        <p className="text-gray-600 mt-2">{expert.name}</p>
      </div>

      {/* Редактор */}
      <ExpertEditor expert={expert} onSave={handleSave} />
    </div>
  )
}
