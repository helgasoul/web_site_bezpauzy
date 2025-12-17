'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface CommunityJoinModalProps {
  isOpen: boolean
  onClose: () => void
}

const communityJoinSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100, 'Имя слишком длинное'),
  email: z.string().email('Введите корректный email адрес'),
  age: z.string().min(1, 'Укажите ваш возраст'),
  location: z.string().optional(),
  interests: z.array(z.string()).optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Необходимо согласие на обработку персональных данных',
  }),
})

type CommunityJoinFormData = z.infer<typeof communityJoinSchema>

export const CommunityJoinModal: FC<CommunityJoinModalProps> = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommunityJoinFormData>({
    resolver: zodResolver(communityJoinSchema),
    defaultValues: {
      name: '',
      email: '',
      age: '',
      location: '',
      interests: [],
      consent: false,
    },
  })

  const onSubmit = async (data: CommunityJoinFormData) => {
    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMessage('')

    try {
      const response = await fetch('/api/community/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Произошла ошибка при регистрации')
      }

      setSubmitStatus('success')
      reset()
      
      // Закрыть модальное окно через 5 секунд после успешной регистрации
      // Пользователь может закрыть раньше кнопкой "Закрыть"
      setTimeout(() => {
        onClose()
        setSubmitStatus(null)
      }, 5000)
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка при регистрации')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-3xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-lavender-bg hover:bg-primary-purple/10 text-deep-navy hover:text-primary-purple transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-h2 font-bold text-deep-navy mb-4">
                Присоединиться к сообществу «Без паузы»
              </h2>
              <p className="text-body text-deep-navy/70">
                Заполните форму ниже, и вы сразу получите доступ ко всем возможностям сообщества
              </p>
            </div>

            {/* Success Message */}
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-card"
              >
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-body font-semibold text-green-800 mb-1">
                      Спасибо! Вы успешно присоединились к сообществу!
                    </p>
                    <p className="text-sm text-green-700">
                      Ваши данные сохранены. Скоро мы свяжемся с вами!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose()
                    setSubmitStatus(null)
                  }}
                  className="w-full mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-colors"
                >
                  Закрыть
                </button>
              </motion.div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-card flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-body text-red-800">{errorMessage}</p>
              </motion.div>
            )}

            {/* Form */}
            {submitStatus !== 'success' && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-deep-navy mb-2">
                    Имя <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    autoComplete="name"
                    className="w-full px-4 py-3 rounded-card border border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-colors text-body text-deep-navy"
                    placeholder="Ваше имя"
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-deep-navy mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-card border border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-colors text-body text-deep-navy"
                    placeholder="your@email.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-deep-navy mb-2">
                    Возраст <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('age')}
                    id="age"
                    className="w-full px-4 py-3 rounded-card border border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-colors text-body text-deep-navy bg-white"
                    disabled={isSubmitting}
                  >
                    <option value="">Выберите возраст</option>
                    <option value="35-40">35-40 лет</option>
                    <option value="40-45">40-45 лет</option>
                    <option value="45-50">45-50 лет</option>
                    <option value="50-55">50-55 лет</option>
                    <option value="55-60">55-60 лет</option>
                    <option value="60+">60+ лет</option>
                  </select>
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                  )}
                </div>

                {/* Location (optional) */}
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-deep-navy mb-2">
                    Город (необязательно)
                  </label>
                  <input
                    {...register('location')}
                    type="text"
                    id="location"
                    autoComplete="address-level2"
                    className="w-full px-4 py-3 rounded-card border border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-colors text-body text-deep-navy"
                    placeholder="Москва"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Consent */}
                <div className="flex items-start gap-3">
                  <input
                    {...register('consent')}
                    type="checkbox"
                    id="consent"
                    className="mt-1 w-5 h-5 rounded border-lavender-bg text-primary-purple focus:ring-2 focus:ring-primary-purple/20"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="consent" className="text-sm text-deep-navy/70 leading-relaxed">
                    Я согласен(а) на обработку персональных данных и получение информационных сообщений от сообщества «Без паузы».{' '}
                    <a href="/privacy" target="_blank" className="text-primary-purple hover:underline">
                      Политика конфиденциальности
                    </a>
                    <span className="text-red-500"> *</span>
                  </label>
                </div>
                {errors.consent && (
                  <p className="text-sm text-red-600">{errors.consent.message}</p>
                )}

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
                        <span>Отправка...</span>
                      </>
                    ) : (
                      <span>Присоединиться к сообществу</span>
                    )}
                  </button>
                </div>

                <p className="text-center text-sm text-deep-navy/60">
                  Участие в сообществе полностью бесплатное
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

