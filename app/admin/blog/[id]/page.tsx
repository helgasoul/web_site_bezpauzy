'use client'

import { useEffect, useState } from 'react'
import { BlogPostEditor } from '@/components/admin/BlogPostEditor'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPost()
  }, [params.id])

  const loadPost = async () => {
    try {
      const response = await fetch(`/api/admin/blog/${params.id}`)

      if (!response.ok) {
        throw new Error('Статья не найдена')
      }

      const data = await response.json()
      setPost(data.post)
    } catch (err) {
      console.error('Error loading post:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (postData: any) => {
    const response = await fetch(`/api/admin/blog/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Ошибка обновления статьи')
    }

    return response.json()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка статьи...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div>
        <Link
          href="/admin/blog"
          className="inline-flex items-center text-purple-600 hover:text-purple-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Назад к списку
        </Link>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error || 'Статья не найдена'}</p>
        </div>
      </div>
    )
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
        <h1 className="text-3xl font-bold text-gray-900">Редактировать статью</h1>
        <p className="text-gray-600 mt-2">{post.title}</p>
      </div>

      {/* Редактор */}
      <BlogPostEditor post={post} onSave={handleSave} />
    </div>
  )
}
