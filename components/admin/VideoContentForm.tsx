'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'

interface VideoFormData {
  title: string
  slug: string
  description: string
  content_type: 'podcast' | 'eva_explains' | 'doctors_explain'
  video_url: string
  video_type: 'youtube' | 'mave' | 'vimeo' | 'direct'
  video_id: string
  thumbnail_url: string
  duration: number
  category: string
  category_name: string
  access_level: 'free' | 'paid1' | 'paid2'
  published: boolean
  tags: string[]
  meta_title: string
  meta_description: string
  // Podcast fields
  podcast_series?: string
  guest_expert_name?: string
  guest_expert_role?: string
  guest_expert_avatar?: string
  host_name?: string
  // Eva explains
  topic?: string
  // Doctors explain
  doctor_name?: string
  doctor_specialty?: string
  doctor_credentials?: string
  doctor_avatar?: string
}

interface VideoContentFormProps {
  initialData?: Partial<VideoFormData> & { id?: string }
  mode: 'create' | 'edit'
}

const CATEGORIES = [
  { value: 'menopause', label: 'Менопауза' },
  { value: 'hormones', label: 'Гормоны и ЗГТ' },
  { value: 'nutrition', label: 'Питание' },
  { value: 'sports', label: 'Спорт и фитнес' },
  { value: 'mental_health', label: 'Психоэмоциональное здоровье' },
  { value: 'sexual_health', label: 'Сексуальное здоровье' },
  { value: 'bone_health', label: 'Здоровье костей' },
  { value: 'heart_health', label: 'Сердечно-сосудистое здоровье' },
  { value: 'sleep', label: 'Сон' },
  { value: 'skin_health', label: 'Кожа и волосы' },
  { value: 'general', label: 'Общее' },
]

export default function VideoContentForm({ initialData, mode }: VideoContentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagsInput, setTagsInput] = useState('')

  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    slug: '',
    description: '',
    content_type: 'doctors_explain',
    video_url: '',
    video_type: 'youtube',
    video_id: '',
    thumbnail_url: '',
    duration: 0,
    category: 'general',
    category_name: 'Общее',
    access_level: 'free',
    published: false,
    tags: [],
    meta_title: '',
    meta_description: '',
    ...initialData,
  })

  useEffect(() => {
    if (initialData?.tags) {
      setTagsInput(initialData.tags.join(', '))
    }
  }, [initialData])

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[а-яё]/g, (char) => {
        const map: Record<string, string> = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
          'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        }
        return map[char] || char
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: mode === 'create' ? generateSlug(title) : prev.slug,
    }))
  }

  const handleCategoryChange = (category: string) => {
    const categoryData = CATEGORIES.find(c => c.value === category)
    setFormData(prev => ({
      ...prev,
      category,
      category_name: categoryData?.label || category,
    }))
  }

  const handleVideoUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, video_url: url }))

    // Auto-extract YouTube ID
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
      if (match) {
        setFormData(prev => ({
          ...prev,
          video_id: match[1],
          video_type: 'youtube',
          thumbnail_url: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Parse tags
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const payload = {
        ...formData,
        tags,
      }

      const url = mode === 'create'
        ? '/api/admin/videos'
        : `/api/admin/videos/${initialData?.id}`

      const method = mode === 'create' ? 'POST' : 'PATCH'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сохранения видео')
      }

      router.push('/admin/videos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/videos"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Создать видео' : 'Редактировать видео'}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {mode === 'edit' && formData.published && (
            <a
              href={`/videos/${formData.content_type === 'podcast' ? 'podcasts/nopause' : formData.content_type === 'eva_explains' ? 'eva-explains' : 'doctors-explain'}/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Просмотр
            </a>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Основная информация</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Название <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Название видео"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="slug"
                required
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                placeholder="nazvanie-video"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Описание <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Краткое описание видео"
              />
            </div>
          </div>

          {/* Video Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Видео</h2>

            <div>
              <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-2">
                URL видео <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="video_url"
                required
                value={formData.video_url}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="mt-1 text-xs text-gray-500">YouTube, Vimeo или прямая ссылка на видео</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="video_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Тип видео
                </label>
                <select
                  id="video_type"
                  value={formData.video_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_type: e.target.value as any }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="youtube">YouTube</option>
                  <option value="mave">Mave</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="direct">Прямая ссылка</option>
                </select>
              </div>

              <div>
                <label htmlFor="video_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Video ID
                </label>
                <input
                  type="text"
                  id="video_id"
                  value={formData.video_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_id: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                  placeholder="Автоматически для YouTube"
                />
              </div>
            </div>

            <div>
              <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-2">
                URL миниатюры <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="thumbnail_url"
                required
                value={formData.thumbnail_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://..."
              />
              {formData.thumbnail_url && (
                <div className="mt-2">
                  <img
                    src={formData.thumbnail_url}
                    alt="Preview"
                    className="w-48 h-auto rounded border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23eee" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EНет изображения%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Длительность (секунды)
              </label>
              <input
                type="number"
                id="duration"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="600"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.duration > 0 && `${Math.floor(formData.duration / 60)}:${String(formData.duration % 60).padStart(2, '0')}`}
              </p>
            </div>
          </div>

          {/* Content Type Specific Fields */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Специфичные поля</h2>

            {formData.content_type === 'podcast' && (
              <>
                <div>
                  <label htmlFor="podcast_series" className="block text-sm font-medium text-gray-700 mb-2">
                    Серия подкаста
                  </label>
                  <input
                    type="text"
                    id="podcast_series"
                    value={formData.podcast_series || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, podcast_series: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="noPause подкаст"
                  />
                </div>
                <div>
                  <label htmlFor="guest_expert_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Имя эксперта
                  </label>
                  <input
                    type="text"
                    id="guest_expert_name"
                    value={formData.guest_expert_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, guest_expert_name: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Иванова Анна"
                  />
                </div>
                <div>
                  <label htmlFor="guest_expert_role" className="block text-sm font-medium text-gray-700 mb-2">
                    Роль эксперта
                  </label>
                  <input
                    type="text"
                    id="guest_expert_role"
                    value={formData.guest_expert_role || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, guest_expert_role: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Гинеколог-эндокринолог"
                  />
                </div>
              </>
            )}

            {formData.content_type === 'eva_explains' && (
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                  Тема
                </label>
                <input
                  type="text"
                  id="topic"
                  value={formData.topic || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Приливы, ЗГТ, Питание..."
                />
              </div>
            )}

            {formData.content_type === 'doctors_explain' && (
              <>
                <div>
                  <label htmlFor="doctor_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Имя врача <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="doctor_name"
                    required
                    value={formData.doctor_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, doctor_name: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Смирнова Анна Владимировна"
                  />
                </div>
                <div>
                  <label htmlFor="doctor_specialty" className="block text-sm font-medium text-gray-700 mb-2">
                    Специализация <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="doctor_specialty"
                    required
                    value={formData.doctor_specialty || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, doctor_specialty: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Кардиолог, Эндокринолог, Гинеколог..."
                  />
                </div>
                <div>
                  <label htmlFor="doctor_credentials" className="block text-sm font-medium text-gray-700 mb-2">
                    Регалии
                  </label>
                  <input
                    type="text"
                    id="doctor_credentials"
                    value={formData.doctor_credentials || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, doctor_credentials: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="к.м.н., врач высшей категории"
                  />
                </div>
                <div>
                  <label htmlFor="doctor_avatar" className="block text-sm font-medium text-gray-700 mb-2">
                    Фото врача (URL)
                  </label>
                  <input
                    type="url"
                    id="doctor_avatar"
                    value={formData.doctor_avatar || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, doctor_avatar: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://..."
                  />
                </div>
              </>
            )}
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">SEO</h2>

            <div>
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                id="meta_title"
                value={formData.meta_title}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="Оставьте пустым для автогенерации"
              />
            </div>

            <div>
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                rows={3}
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="120-155 символов"
              />
              <p className="mt-1 text-xs text-gray-500">{formData.meta_description.length} символов</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Публикация</h2>

            <div>
              <label htmlFor="content_type" className="block text-sm font-medium text-gray-700 mb-2">
                Тип контента <span className="text-red-500">*</span>
              </label>
              <select
                id="content_type"
                required
                value={formData.content_type}
                onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value as any }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="podcast">Подкаст noPause</option>
                <option value="eva_explains">Ева объясняет</option>
                <option value="doctors_explain">Врачи объясняют</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Категория <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="access_level" className="block text-sm font-medium text-gray-700 mb-2">
                Уровень доступа
              </label>
              <select
                id="access_level"
                value={formData.access_level}
                onChange={(e) => setFormData(prev => ({ ...prev, access_level: e.target.value as any }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="free">Бесплатно</option>
                <option value="paid1">Paid1 (800₽/мес)</option>
                <option value="paid2">Paid2 (2500₽/мес)</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                Опубликовать
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Теги</h2>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Теги (через запятую)
              </label>
              <input
                type="text"
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                placeholder="менопауза, гормоны, здоровье"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
