'use client'

import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Loader2, CheckCircle2, AlertCircle, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { RegisterModal } from './RegisterModal'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthStep = 'method' | 'generate' | 'verify' | 'email' | 'success' | 'error'
type AuthMethod = 'telegram' | 'email'

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter()
  const [step, setStep] = useState<AuthStep>('method')
  const [method, setMethod] = useState<AuthMethod>('telegram')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  // Сбрасываем состояние при закрытии
  useEffect(() => {
    if (!isOpen) {
      setStep('method')
      setMethod('telegram')
      setCode('')
      setEmail('')
      setGeneratedCode('')
      setError(null)
      setExpiresAt(null)
    }
  }, [isOpen])

  // Генерируем код при переходе к шагу verify для Telegram
  useEffect(() => {
    if (isOpen && step === 'generate' && method === 'telegram') {
      generateCode()
    }
  }, [isOpen, step, method])

  const generateCode = async () => {
    setLoading(true)
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
      setExpiresAt(new Date(data.expiresAt))
      setStep('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при генерации кода')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError('Код должен состоять из 6 цифр')
      return
    }

    setLoading(true)
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

      setStep('success')
      // Перенаправляем в личный кабинет через 1 секунду
      setTimeout(() => {
        router.push('/account')
        onClose()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при проверке кода')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
    setError(null)
  }

  const handleEmailLogin = async () => {
    if (!email || !email.includes('@')) {
      setError('Введите корректный email адрес')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/email/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при входе')
      }

      setStep('success')
      // Перенаправляем в личный кабинет через 1 секунду
      setTimeout(() => {
        router.push('/account')
        onClose()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при входе')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleMethodSelect = (selectedMethod: AuthMethod) => {
    setMethod(selectedMethod)
    setError(null)
    if (selectedMethod === 'telegram') {
      setStep('generate')
    } else {
      setStep('email')
    }
  }

  const handleClose = () => {
    setStep('method')
    setMethod('telegram')
    setCode('')
    setEmail('')
    setGeneratedCode('')
    setError(null)
    setExpiresAt(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-deep-navy/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-soft-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 z-10"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-deep-navy/60 hover:text-deep-navy transition-colors"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>

          {/* Content */}
          {step === 'method' && (
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-2 text-center">
                Выберите способ входа
              </h2>
              <p className="text-body text-deep-navy/70 mb-6 text-center">
                Войдите через Telegram код или email
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <User className="w-5 h-5" />
                  <span>Зарегистрироваться</span>
                </button>

                <button
                  onClick={() => handleMethodSelect('telegram')}
                  className="w-full bg-white border-2 border-primary-purple text-primary-purple px-6 py-4 rounded-xl font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Войти через Telegram</span>
                </button>

                <button
                  onClick={() => handleMethodSelect('email')}
                  className="w-full bg-white border-2 border-primary-purple text-primary-purple px-6 py-4 rounded-xl font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <span>Войти по email</span>
                </button>
              </div>
            </div>
          )}

          {step === 'generate' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6">
                {loading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <MessageCircle className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                Вход через Telegram
              </h2>
              <p className="text-body text-deep-navy/70 mb-6">
                Генерируем код для входа...
              </p>
            </div>
          )}

          {step === 'email' && (
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-2 text-center">
                Вход по email
              </h2>
              <p className="text-body text-deep-navy/70 mb-6 text-center">
                Введите email, который вы указали при регистрации в боте
              </p>

              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-deep-navy mb-2">
                  Email адрес
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple transition-colors"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-error mb-4 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleEmailLogin}
                disabled={loading || !email}
                className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Вход...</span>
                  </>
                ) : (
                  <span>Войти</span>
                )}
              </button>

              <button
                onClick={() => setStep('method')}
                disabled={loading}
                className="w-full mt-3 text-sm text-deep-navy/60 hover:text-deep-navy transition-colors"
              >
                Вернуться к выбору способа входа
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-2 text-center">
                Введите код из Telegram
              </h2>
              <p className="text-body text-deep-navy/70 mb-6 text-center">
                Запросите код в Telegram боте, затем введите его здесь
              </p>

              {generatedCode && (
                <div className="bg-primary-purple/10 border-2 border-primary-purple/20 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-deep-navy/70 mb-2 text-center">
                    Ваш код для запроса в боте:
                  </p>
                  <p className="text-2xl font-bold text-primary-purple text-center font-mono">
                    {generatedCode}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="code" className="block text-sm font-medium text-deep-navy mb-2">
                  Код из Telegram
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-mono font-bold border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple transition-colors"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-error mb-4 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={verifyCode}
                disabled={loading || code.length !== 6}
                className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Проверка...</span>
                  </>
                ) : (
                  <span>Войти</span>
                )}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={generateCode}
                  disabled={loading}
                  className="flex-1 text-sm text-deep-navy/60 hover:text-deep-navy transition-colors"
                >
                  Запросить новый код
                </button>
                <button
                  onClick={() => setStep('method')}
                  disabled={loading}
                  className="flex-1 text-sm text-deep-navy/60 hover:text-deep-navy transition-colors"
                >
                  Другой способ входа
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                Вход выполнен!
              </h2>
              <p className="text-body text-deep-navy/70">
                Перенаправляем в личный кабинет...
              </p>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                Ошибка
              </h2>
              <p className="text-body text-deep-navy/70 mb-6">
                {error || 'Произошла ошибка'}
              </p>
              <button
                onClick={() => {
                  setStep('generate')
                  setError(null)
                  generateCode()
                }}
                className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Попробовать снова
              </button>
            </div>
          )}
        </motion.div>
      </div>
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={() => {
          onClose()
          router.push('/account')
        }}
      />
    </AnimatePresence>
  )
}

