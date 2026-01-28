'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import { Save } from 'lucide-react'

interface Expert {
  id?: string
  category: 'gynecologist' | 'mammologist' | 'nutritionist'
  category_name: string
  name: string
  specialization: string
  role: string
  description: string
  image?: string
  cv?: string
  bio?: string
  bot_command?: string
  telegram_bot_link?: string
  order_index: number
}

interface ExpertEditorProps {
  expert: Expert
  onSave: (expert: Partial<Expert>) => Promise<void>
}

const categoryOptions = [
  { value: 'gynecologist', label: 'Кабинет гинеколога' },
  { value: 'mammologist', label: 'Кабинет маммолога' },
  { value: 'nutritionist', label: 'Кухня нутрициолога' },
]

export function ExpertEditor({ expert, onSave }: ExpertEditorProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Expert>>({
    category: expert.category,
    category_name: expert.category_name,
    name: expert.name,
    specialization: expert.specialization,
    role: expert.role,
    description: expert.description,
    image: expert.image || '',
    cv: expert.cv || '',
    bio: expert.bio || '',
    bot_command: expert.bot_command || '',
    telegram_bot_link: expert.telegram_bot_link || '',
    order_index: expert.order_index,
  })

  const handleCategoryChange = (category: string) => {
    const categoryOption = categoryOptions.find((opt) => opt.value === category)
    setFormData((prev) => ({
      ...prev,
      category: category as any,
      category_name: categoryOption?.label || '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await onSave(formData)
      alert('Эксперт успешно обновлен!')
    } catch (error) {
      console.error('Error saving expert:', error)
      alert('Ошибка при сохранении эксперта')
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

          <div className="grid grid-cols-2 gap-4">
            {/* Имя */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя эксперта *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Роль */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Роль *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                required
                placeholder="Гинеколог, Маммолог..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Специализация */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Специализация *
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData((prev) => ({ ...prev, specialization: e.target.value }))}
              required
              placeholder="Гинеколог-эндокринолог"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Краткое описание *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Фото */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL фото эксперта
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
              placeholder="/experts/expert-name.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {formData.image && (
              <img
                src={formData.image}
                alt="Preview"
                className="mt-2 w-24 h-24 rounded-full object-cover"
              />
            )}
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
      </div>

      {/* Детальная информация */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Детальная информация</h2>

        <div className="space-y-4">
          {/* CV / Портфолио */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CV / Портфолио (Markdown)
            </label>
            <textarea
              value={formData.cv}
              onChange={(e) => setFormData((prev) => ({ ...prev, cv: e.target.value }))}
              rows={8}
              placeholder="## Образование\n\n- Университет...\n\n## Опыт работы\n\n- Клиника..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          {/* Биография */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Биография
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              rows={4}
              placeholder="Подробная биография эксперта..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Telegram Bot Integration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Интеграция с Telegram-ботом</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Команда бота
            </label>
            <input
              type="text"
              value={formData.bot_command}
              onChange={(e) => setFormData((prev) => ({ ...prev, bot_command: e.target.value }))}
              placeholder="consultation_gynecologist"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ссылка на бота
            </label>
            <input
              type="text"
              value={formData.telegram_bot_link}
              onChange={(e) => setFormData((prev) => ({ ...prev, telegram_bot_link: e.target.value }))}
              placeholder="https://t.me/bezpauzy_bot?start=consultation_gynecologist"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex items-center justify-end bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </div>
    </form>
  )
}
