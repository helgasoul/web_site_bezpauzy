'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface Category {
  id: string
  name: string
  slug: string
}

interface CreateTopicModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  categories: Category[]
  userEmail: string | null
}

const createTopicSchema = z.object({
  category_id: z.string().uuid('Выберите категорию'),
  title: z.string().min(5, 'Заголовок должен содержать минимум 5 символов').max(200, 'Заголовок слишком длинный'),
  content: z.string().min(10, 'Содержание должно содержать минимум 10 символов').max(5000, 'Содержание слишком длинное'),
})

type CreateTopicFormData = z.infer<typeof createTopicSchema>

export const CreateTopicModal: FC<CreateTopicModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  userEmail,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTopicFormData>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      category_id: '',
      title: '',
      content: '',
    },
  })

  const onSubmit = async (data: CreateTopicFormData) => {
    if (!userEmail) {
      setErrorMessage('Необходимо войти в сообщество для создания темы')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      // Get user name from localStorage or use email
      const userName = localStorage.getItem('bezpauzy_community_name') || userEmail.split('@')[0]

      const response = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          author_email: userEmail,
          author_name: userName,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Произошла ошибка при создании темы')
      }

      reset()
      onSuccess()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка при создании темы')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-3xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-lavender-bg hover:bg-primary-purple/10 text-deep-navy hover:text-primary-purple transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 md:p-12">
            <h2 className="text-h2 font-bold text-deep-navy mb-6">
              Создать новую тему
            </h2>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-card flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-body text-red-800">{errorMessage}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-semibold text-deep-navy mb-2">
                  Категория <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('category_id')}
                  id="category_id"
                  className="w-full px-4 py-3 rounded-card border border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-colors text-body bg-white text-deep-navy"
                  disabled={isSubmitting}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label htmlFor="topic-title" className="block text-sm font-semibold text-deep-navy mb-2">
                  Заголовок темы <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  type="text"
                  id="topic-title"
                  className="w-full px-4 py-3 rounded-card border border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-colors text-body text-deep-navy"
                  placeholder="Например: Как справиться с приливами?"
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label htmlFor="topic-content" className="block text-sm font-semibold text-deep-navy mb-2">
                  Содержание <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('content')}
                  id="topic-content"
                  rows={8}
                  className="w-full px-4 py-3 rounded-card border border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-colors text-body text-deep-navy resize-none"
                  placeholder="Опишите ваш вопрос или тему для обсуждения..."
                  disabled={isSubmitting}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-strong hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Создание...</span>
                    </>
                  ) : (
                    <span>Создать тему</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

