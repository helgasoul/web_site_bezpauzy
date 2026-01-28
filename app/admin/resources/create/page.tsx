'use client'

import { ResourceEditor } from '@/components/admin/ResourceEditor'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateResourcePage() {
  const handleSave = async (resourceData: any) => {
    const response = await fetch('/api/admin/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resourceData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Ошибка создания ресурса')
    }

    return response.json()
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <Link
          href="/admin/resources"
          className="inline-flex items-center text-purple-600 hover:text-purple-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Создать ресурс</h1>
        <p className="text-gray-600 mt-2">Создание нового гайда или чек-листа</p>
      </div>

      {/* Редактор */}
      <ResourceEditor onSave={handleSave} />
    </div>
  )
}
