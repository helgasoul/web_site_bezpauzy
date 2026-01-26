'use client'

import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react'

interface TelegramAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
}

export const TelegramAuthModal: FC<TelegramAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'generate' | 'verify'>('generate')
  const [code, setCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Генерация кода
  const handleGenerateCode = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/telegram/generate-code', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось создать код')
      }

      setGeneratedCode(data.code)
      setStep('verify')
      // Показываем инструкцию пользователю
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  // Проверка кода
  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Код должен состоять из 6 цифр')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/telegram/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Неверный код')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess(data.user)
        onClose()
        // Сброс состояния
        setStep('generate')
        setCode('')
        setGeneratedCode(null)
        setSuccess(false)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  // Сброс при закрытии
  useEffect(() => {
    if (!isOpen) {
      setStep('generate')
      setCode('')
      setGeneratedCode(null)
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-deep-navy/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-deep-navy/50 hover:text-deep-navy transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {step === 'generate' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-h3 font-bold text-deep-navy mb-4">
                Вход через Telegram
              </h3>
              <p className="text-body text-deep-navy/70 mb-6">
                Для входа в личный кабинет необходимо получить код в Telegram боте.
              </p>
              
              <div className="bg-lavender-bg rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-deep-navy mb-2">📱 Инструкция:</p>
                <ol className="text-sm text-deep-navy/70 space-y-2 list-decimal list-inside">
                  <li>Нажмите &quot;Создать код&quot; ниже</li>
                  <li>Откройте Telegram бота <span className="font-semibold">@bezpauzy_bot</span></li>
                  <li>Отправьте команду <span className="font-mono bg-white px-2 py-1 rounded">/code</span></li>
                  <li>Бот отправит вам код</li>
                  <li>Введите код на сайте</li>
                </ol>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerateCode}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Генерирую код...
                  </>
                ) : (
                  'Создать код'
                )}
              </button>

              <p className="text-xs text-deep-navy/60 mt-4">
                После создания кода откройте бота{' '}
                <a
                  href="https://t.me/bezpauzy_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-purple hover:underline"
                >
                  @bezpauzy_bot
                </a>{' '}
                и запросите код для входа
              </p>
            </div>
          )}

          {step === 'verify' && generatedCode && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full flex items-center justify-center mx-auto mb-6">
                {success ? (
                  <CheckCircle2 className="w-8 h-8 text-white" />
                ) : (
                  <MessageCircle className="w-8 h-8 text-white" />
                )}
              </div>
              <h3 className="text-h3 font-bold text-deep-navy mb-4">
                {success ? 'Успешно!' : 'Введите код'}
              </h3>
              <p className="text-body text-deep-navy/70 mb-6">
                {success
                  ? 'Вы успешно вошли в систему'
                  : 'Введите 6-значный код, который вы получили в Telegram боте'}
              </p>

              {!success && (
                <>
                  <div className="mb-6">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={code}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        setCode(value)
                        setError(null)
                      }}
                      className="w-full px-4 py-3 text-center text-3xl font-bold tracking-widest rounded-lg border-2 border-primary-purple focus:ring-2 focus:ring-primary-purple focus:border-primary-purple outline-none"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleVerifyCode}
                    disabled={isLoading || code.length !== 6}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Проверяю...
                      </>
                    ) : (
                      'Войти'
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setStep('generate')
                      setCode('')
                      setGeneratedCode(null)
                      setError(null)
                    }}
                    className="mt-4 text-sm text-deep-navy/60 hover:text-deep-navy transition-colors"
                  >
                    Создать новый код
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

