'use client'

import { FC, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface UnsubscribePageProps {
  token?: string
  email?: string
}

export const UnsubscribePage: FC<UnsubscribePageProps> = ({ token, email: initialEmail }) => {
  const [email, setEmail] = useState(initialEmail || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isAlreadyUnsubscribed, setIsAlreadyUnsubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoProcessed, setAutoProcessed] = useState(false)

  const handleUnsubscribe = useCallback(async (unsubscribeToken?: string) => {
    if (!unsubscribeToken && !email) {
      setError('Пожалуйста, введите email адрес')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: unsubscribeToken || token,
          email: unsubscribeToken || token ? undefined : email.toLowerCase().trim(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        if (data.alreadyUnsubscribed) {
          setIsAlreadyUnsubscribed(true)
        }
      } else {
        setError(data.error || 'Произошла ошибка при отписке')
      }
    } catch (err) {
      setError('Произошла ошибка сети. Попробуйте ещё раз.')
    } finally {
      setIsProcessing(false)
    }
  }, [email, token])

  // Автоматическая отписка при наличии token
  useEffect(() => {
    if (token && !autoProcessed) {
      setAutoProcessed(true)
      handleUnsubscribe(token)
    }
  }, [token, autoProcessed, handleUnsubscribe])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleUnsubscribe()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-white via-lavender-bg to-white flex items-center justify-center py-16 px-4">
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-strong border border-lavender-bg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-purple/10 rounded-full mb-4">
              <Mail className="w-8 h-8 text-primary-purple" />
            </div>
            <h1 className="text-h2 font-bold text-deep-navy mb-2">
              Отписка от рассылки
            </h1>
            <p className="text-body text-deep-navy/70">
              Мы сожалеем, что вы решили отписаться
            </p>
          </div>

          {/* Success State */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ocean-wave-start/10 rounded-full mb-4">
                {isAlreadyUnsubscribed ? (
                  <XCircle className="w-8 h-8 text-deep-navy/50" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-ocean-wave-start" />
                )}
              </div>
              <h2 className="text-h3 font-semibold text-deep-navy mb-3">
                {isAlreadyUnsubscribed
                  ? 'Вы уже отписаны'
                  : 'Вы успешно отписаны'}
              </h2>
              <p className="text-body text-deep-navy/70 mb-6">
                {isAlreadyUnsubscribed
                  ? 'Этот email адрес уже отписан от нашей рассылки.'
                  : 'Вы больше не будете получать письма от нас. Если передумаете, вы всегда можете подписаться снова.'}
              </p>
              <div className="space-y-3">
                <Link href="/">
                  <Button variant="primary" className="w-full">
                    Вернуться на главную
                  </Button>
                </Link>
                {!isAlreadyUnsubscribed && (
                  <Link href="/newsletter">
                    <Button variant="secondary" className="w-full">
                      Подписаться снова
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* Form State */}
          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {!token && (
                <div>
                  <label htmlFor="email" className="block text-body-small font-medium text-deep-navy mb-2">
                    Email адрес
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={isProcessing}
                      className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-body text-deep-navy placeholder:text-deep-navy/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-2 text-caption text-deep-navy/60">
                    Введите email адрес, на который вы получали рассылку
                  </p>
                </div>
              )}

              {token && (
                <div className="bg-lavender-bg rounded-2xl p-4 text-center">
                  <p className="text-body-small text-deep-navy/70">
                    Обработка запроса на отписку...
                  </p>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-4"
                >
                  <p className="text-body-small text-red-600">{error}</p>
                </motion.div>
              )}

              {!token && (
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    'Отписаться от рассылки'
                  )}
                </Button>
              )}

              {isProcessing && token && (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-purple mx-auto mb-4" />
                  <p className="text-body-small text-deep-navy/70">
                    Обработка запроса...
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-lavender-bg">
                <p className="text-caption text-deep-navy/60 text-center">
                  Если вы передумали, вы всегда можете{' '}
                  <Link href="/newsletter" className="text-primary-purple hover:underline">
                    подписаться снова
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-lavender-bg">
            <p className="text-xs text-deep-navy/50 text-center">
              Если у вас возникли проблемы с отпиской,{' '}
              <Link href="/about" className="text-primary-purple hover:underline">
                свяжитесь с нами
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

