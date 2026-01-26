'use client'

import { FC, useState } from 'react'
import { X, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { validateEmail } from '@/lib/utils/validation'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SupportModal: FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    // Email validation
    if (!validateEmail(formData.email)) {
      setError('Пожалуйста, введите корректный email адрес')
      return
    }

    setIsSubmitting(true)

    try {
      const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
      
      const response = await fetch('/api/support/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          pageUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Произошла ошибка при отправке обращения')
      }

      setIsSuccess(true)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })

      // Close modal after 2 seconds
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при отправке обращения')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="sticky top-0 bg-white border-b border-lavender-bg px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-ocean-wave-start via-ocean-wave-start/90 to-ocean-wave-end rounded-full flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-h5 font-semibold text-deep-navy">Написать в поддержку</h3>
                    <p className="text-caption text-deep-navy/60">Мы ответим в течение 24 часов</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-lavender-bg rounded-full transition-colors"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5 text-deep-navy" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-ocean-wave-start to-ocean-wave-end rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-h4 font-semibold text-deep-navy text-center">
                      Спасибо за обращение!
                    </h4>
                    <p className="text-body text-deep-navy/70 text-center">
                      Мы получили ваше сообщение и ответим в течение 24 часов.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-body-small font-medium text-deep-navy mb-2">
                        Имя <span className="text-primary-purple">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all"
                        placeholder="Как к вам обращаться?"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-body-small font-medium text-deep-navy mb-2">
                        Email <span className="text-primary-purple">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-body-small font-medium text-deep-navy mb-2">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all"
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-body-small font-medium text-deep-navy mb-2">
                        Тема обращения
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all"
                        placeholder="Кратко опишите тему обращения"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-body-small font-medium text-deep-navy mb-2">
                        Сообщение <span className="text-primary-purple">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 transition-all resize-none"
                        placeholder="Опишите вашу проблему или вопрос подробнее..."
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <p className="text-body-small text-red-600">{error}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1 flex items-center justify-center gap-2 py-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Отправка...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Отправить</span>
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1 sm:flex-initial"
                        disabled={isSubmitting}
                      >
                        Отмена
                      </Button>
                    </div>

                    <p className="text-caption text-deep-navy/60 text-center">
                      Нажимая кнопку &quot;Отправить&quot;, вы соглашаетесь с{' '}
                      <a
                        href="/privacy"
                        target="_blank"
                        className="text-primary-purple hover:underline"
                      >
                        Политикой конфиденциальности
                      </a>
                    </p>
                  </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
