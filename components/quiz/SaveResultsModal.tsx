'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { MRSResults } from './MRSQuiz'
import { validateEmail } from '@/lib/utils/validation'

interface SaveResultsModalProps {
  isOpen: boolean
  onClose: () => void
  results: MRSResults
  onSaveSuccess: () => void
}

export const SaveResultsModal: FC<SaveResultsModalProps> = ({
  isOpen,
  onClose,
  results,
  onSaveSuccess,
}) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic email validation
    if (!validateEmail(email)) {
      setError('Пожалуйста, введите корректный email адрес')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/quiz/save-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          results,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось сохранить результаты')
      }

      // Store email in localStorage for future use
      if (data.email) {
        localStorage.setItem('user_email', data.email)
      }

      setSuccess(true)
      setTimeout(() => {
        onSaveSuccess()
        onClose()
        setEmail('')
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-deep-navy/60 hover:text-deep-navy transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </motion.div>
              <h3 className="text-h3 font-bold text-deep-navy mb-2">
                Результаты сохранены!
              </h3>
              <p className="text-body text-deep-navy/70">
                Теперь вы можете просмотреть их в личном кабинете
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-h3 font-bold text-deep-navy mb-2">
                  Сохранить результаты
                </h3>
                <p className="text-body text-deep-navy/70">
                  Введите ваш email, чтобы сохранить результаты квиза в личном кабинете
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-deep-navy mb-2"
                  >
                    Email адрес
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border-2 border-lavender-bg text-deep-navy rounded-xl font-semibold hover:bg-lavender-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Сохранение...</span>
                      </>
                    ) : (
                      'Сохранить'
                    )}
                  </button>
                </div>
              </form>

              <p className="text-xs text-deep-navy/60 mt-4 text-center">
                Нажимая «Сохранить», вы соглашаетесь с обработкой ваших данных
              </p>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

