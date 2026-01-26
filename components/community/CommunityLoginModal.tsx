'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, AlertCircle, Mail, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

interface CommunityLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (email: string, name?: string) => void
  onJoinClick?: () => void
}

const loginSchema = z.object({
  email: z.string().email('Введите корректный email адрес'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const CommunityLoginModal: FC<CommunityLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onJoinClick,
}) => {
  const [isChecking, setIsChecking] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsChecking(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/community/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Произошла ошибка при проверке')
      }

      if (result.isMember) {
        // Save email and name to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('bezpauzy_community_email', data.email)
          if (result.member?.name) {
            localStorage.setItem('bezpauzy_community_name', result.member.name)
          }
        }
        onSuccess(data.email, result.member?.name)
        reset()
        onClose()
      } else {
        setErrorMessage('Этот email не зарегистрирован в сообществе. Пожалуйста, сначала присоединитесь к сообществу.')
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка при проверке')
    } finally {
      setIsChecking(false)
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
          className="relative bg-white rounded-3xl shadow-strong max-w-md w-full"
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-h2 font-bold text-deep-navy mb-4">
                Войти
              </h2>
              <p className="text-body text-deep-navy/70">
                Введите email, который вы использовали при регистрации
              </p>
            </div>

            {/* Error Message */}
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

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-semibold text-deep-navy mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" />
                  <input
                    {...register('email')}
                    type="email"
                    id="login-email"
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3 rounded-card border border-lavender-bg focus:border-primary-purple focus:ring-2 focus:ring-primary-purple/20 outline-none transition-colors text-body text-deep-navy"
                    placeholder="your@email.com"
                    disabled={isChecking}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isChecking}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-strong hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Проверка...</span>
                    </>
                  ) : (
                    <span>Войти</span>
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-deep-navy/60">
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    if (onJoinClick) {
                      onJoinClick()
                    }
                  }}
                  className="text-primary-purple hover:underline font-medium"
                >
                  Присоединиться к сообществу
                </button>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

