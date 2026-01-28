'use client'

import { BlogPostEditor } from '@/components/admin/BlogPostEditor'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateBlogPostPage() {
  const handleSave = async (postData: any) => {
    const response = await fetch('/api/admin/blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Ошибка создания статьи')
    }

    return response.json()
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center text-purple-600 hover:text-purple-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Создать статью</h1>
        <p className="text-gray-600 mt-2">Создание новой статьи для блога</p>
      </div>

      {/* Редактор */}
      <BlogPostEditor onSave={handleSave} />
    </div>
  )
}
