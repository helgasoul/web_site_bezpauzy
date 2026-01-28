'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'

interface Resource {
  id?: string
  resource_type: 'checklist' | 'guide'
  title: string
  slug: string
  description: string
  icon_name?: string
  cover_image?: string
  pdf_source: 'static' | 'dynamic' | 'supabase_storage'
  pdf_file_path: string
  pdf_filename: string
  category?: string
  tags: string[]
  order_index: number
  published: boolean
  coming_soon: boolean
  meta_title?: string
  meta_description?: string
  meta_keywords: string[]
}

interface ResourceEditorProps {
  resource?: Resource
  onSave: (resource: Partial<Resource>) => Promise<void>
}

export function ResourceEditor({ resource, onSave }: ResourceEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Resource>>({
    resource_type: resource?.resource_type || 'checklist',
    title: resource?.title || '',
    slug: resource?.slug || '',
    description: resource?.description || '',
    icon_name: resource?.icon_name || '',
    cover_image: resource?.cover_image || '',
    pdf_source: resource?.pdf_source || 'static',
    pdf_file_path: resource?.pdf_file_path || '',
    pdf_filename: resource?.pdf_filename || '',
    category: resource?.category || '',
    tags: resource?.tags || [],
    order_index: resource?.order_index || 0,
    published: resource?.published || false,
    coming_soon: resource?.coming_soon || false,
    meta_title: resource?.meta_title || '',
    meta_description: resource?.meta_description || '',
    meta_keywords: resource?.meta_keywords || [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await onSave(formData)
      alert('Ресурс успешно сохранен!')
      router.push('/admin/resources')
    } catch (error) {
      console.error('Error saving resource:', error)
      alert('Ошибка при сохранении ресурса')
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
          {/* Тип ресурса */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип ресурса *
            </label>
            <select
              value={formData.resource_type}
              onChange={(e) => setFormData((prev) => ({ ...prev, resource_type: e.target.value as any }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="checklist">Чек-лист</option>
              <option value="guide">Гайд</option>
            </select>
          </div>

          {/* Заголовок */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название *
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
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Категория */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Менопауза, Здоровье..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Порядок отображения */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Порядок отображения
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData((prev) => ({ ...prev, order_index: parseInt(e.target.value) }))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Иконка */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Иконка (lucide-react)
              </label>
              <input
                type="text"
                value={formData.icon_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, icon_name: e.target.value }))}
                placeholder="FileCheck, BookOpen..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Обложка */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL обложки
              </label>
              <input
                type="text"
                value={formData.cover_image}
                onChange={(e) => setFormData((prev) => ({ ...prev, cover_image: e.target.value }))}
                placeholder="/resources/cover.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PDF файл */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">PDF файл</h2>

        <div className="space-y-4">
          {/* Источник PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Источник PDF *
            </label>
            <select
              value={formData.pdf_source}
              onChange={(e) => setFormData((prev) => ({ ...prev, pdf_source: e.target.value as any }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="static">Статический файл (public/)</option>
              <option value="dynamic">Динамическая генерация (API)</option>
              <option value="supabase_storage">Supabase Storage</option>
            </select>
          </div>

          {/* Путь к файлу */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Путь к файлу *
            </label>
            <input
              type="text"
              value={formData.pdf_file_path}
              onChange={(e) => setFormData((prev) => ({ ...prev, pdf_file_path: e.target.value }))}
              required
              placeholder={
                formData.pdf_source === 'static'
                  ? '/guides/file.pdf'
                  : formData.pdf_source === 'dynamic'
                  ? '/api/guides/generate'
                  : 'resources/file.pdf'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Имя файла для скачивания */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя файла для скачивания *
            </label>
            <input
              type="text"
              value={formData.pdf_filename}
              onChange={(e) => setFormData((prev) => ({ ...prev, pdf_filename: e.target.value }))}
              required
              placeholder="Чеклист_лабораторных_анализов.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
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
              placeholder={formData.description}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Публикация */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Публикация</h2>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={formData.published}
              onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Опубликовать ресурс
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="coming_soon"
              checked={formData.coming_soon}
              onChange={(e) => setFormData((prev) => ({ ...prev, coming_soon: e.target.checked }))}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="coming_soon" className="ml-2 block text-sm text-gray-900">
              Скоро появится
            </label>
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <button
          type="button"
          onClick={() => router.push('/admin/resources')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  )
}
