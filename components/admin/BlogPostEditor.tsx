'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, X } from 'lucide-react'

interface BlogPost {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: 'gynecologist' | 'mammologist' | 'nutritionist'
  category_name: string
  author_name: string
  author_role: string
  author_avatar?: string
  image: string
  published: boolean
  key_takeaways: string[]
  article_references: any[]
  meta_title?: string
  meta_description?: string
  meta_keywords: string[]
}

interface BlogPostEditorProps {
  post?: BlogPost
  onSave: (post: Partial<BlogPost>) => Promise<void>
}

const categoryOptions = [
  { value: 'gynecologist', label: 'Кабинет гинеколога' },
  { value: 'mammologist', label: 'Кабинет маммолога' },
  { value: 'nutritionist', label: 'Кухня нутрициолога' },
]

export function BlogPostEditor({ post, onSave }: BlogPostEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    category: post?.category || 'gynecologist',
    category_name: post?.category_name || 'Кабинет гинеколога',
    author_name: post?.author_name || '',
    author_role: post?.author_role || '',
    author_avatar: post?.author_avatar || '',
    image: post?.image || '',
    published: post?.published || false,
    key_takeaways: post?.key_takeaways || [],
    article_references: post?.article_references || [],
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
    meta_keywords: post?.meta_keywords || [],
  })

  // Автогенерация slug из заголовка
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^а-яa-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }))
  }

  const handleCategoryChange = (category: string) => {
    const categoryOption = categoryOptions.find((opt) => opt.value === category)
    setFormData((prev) => ({
      ...prev,
      category: category as any,
      category_name: categoryOption?.label || '',
    }))
  }

  const handleKeyTakeawayChange = (index: number, value: string) => {
    const newTakeaways = [...(formData.key_takeaways || [])]
    newTakeaways[index] = value
    setFormData((prev) => ({ ...prev, key_takeaways: newTakeaways }))
  }

  const addKeyTakeaway = () => {
    setFormData((prev) => ({
      ...prev,
      key_takeaways: [...(prev.key_takeaways || []), ''],
    }))
  }

  const removeKeyTakeaway = (index: number) => {
    const newTakeaways = (formData.key_takeaways || []).filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, key_takeaways: newTakeaways }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await onSave(formData)
      alert('Статья успешно сохранена!')
      router.push('/admin/blog')
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Ошибка при сохранении статьи')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Основная информация */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h2>

        <div className="space-y-4">
          {/* Заголовок */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Заголовок *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL) *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">URL статьи: /blog/{formData.slug}</p>
          </div>

          {/* Категория */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Категория *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Превью */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Краткое описание *
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Изображение */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL изображения *
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
              required
              placeholder="/blog/article-image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="mt-2 w-48 h-32 object-cover rounded"
              />
            )}
          </div>
        </div>
      </div>

      {/* Автор */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация об авторе</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя автора *
              </label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, author_name: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Должность автора *
              </label>
              <input
                type="text"
                value={formData.author_role}
                onChange={(e) => setFormData((prev) => ({ ...prev, author_role: e.target.value }))}
                required
                placeholder="Гинеколог-эндокринолог"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL аватара автора
            </label>
            <input
              type="text"
              value={formData.author_avatar}
              onChange={(e) => setFormData((prev) => ({ ...prev, author_avatar: e.target.value }))}
              placeholder="/authors/author-name.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Содержание */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Содержание статьи</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Контент (Markdown) *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            required
            rows={20}
            placeholder="# Заголовок\n\n**Жирный текст**\n\n*Курсив*\n\n- Список"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Используйте Markdown для форматирования текста
          </p>
        </div>
      </div>

      {/* Ключевые выводы */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ключевые выводы</h2>
          <button
            type="button"
            onClick={addKeyTakeaway}
            className="text-sm text-purple-600 hover:text-purple-900"
          >
            + Добавить вывод
          </button>
        </div>

        <div className="space-y-2">
          {(formData.key_takeaways || []).map((takeaway, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={takeaway}
                onChange={(e) => handleKeyTakeawayChange(index, e.target.value)}
                placeholder="Ключевой вывод"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removeKeyTakeaway(index)}
                className="p-2 text-red-600 hover:text-red-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => setFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
              placeholder={formData.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
              placeholder={formData.excerpt}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Публикация */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Публикация</h2>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
            Опубликовать статью
          </label>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>

        <div className="flex items-center gap-3">
          {formData.published && formData.slug && (
            <a
              href={`/blog/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              Предпросмотр
            </a>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </form>
  )
}
