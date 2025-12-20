'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Lock, Loader2, AlertCircle, CheckCircle2, Copy, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const RegisterModal: FC<RegisterModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'register' | 'link-telegram' | 'success'>('register')
  const [linkCode, setLinkCode] = useState('')
  const [deepLink, setDeepLink] = useState('')
  const [codeCopied, setCodeCopied] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Валидация
    if (username.length < 3) {
      setError('Логин должен содержать минимум 3 символа')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Логин может содержать только буквы, цифры и подчеркивание')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при регистрации')
      }

      // Регистрация успешна
      // Если пользователь хочет общаться с Евой, показываем шаг привязки
      // Иначе сразу переходим к успеху
      setStep('link-telegram')
      generateLinkCode()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  const generateLinkCode = async () => {
    try {
      const response = await fetch('/api/auth/link-telegram/generate-code', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось создать код')
      }

      if (data.alreadyLinked) {
        // Уже привязан, переходим к успеху
        setStep('success')
        setTimeout(() => {
          onSuccess?.()
          router.push('/account')
          onClose()
        }, 1500)
        return
      }

      setLinkCode(data.code)
      setDeepLink(data.deepLink)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании кода')
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(linkCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const skipTelegramLink = () => {
    setStep('success')
    setTimeout(() => {
      onSuccess?.()
      router.push('/account')
      onClose()
    }, 1500)
  }

  const handleClose = () => {
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setStep('register')
    setLinkCode('')
    setDeepLink('')
    setCodeCopied(false)
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
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 z-10"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-deep-navy/60 hover:text-deep-navy transition-colors"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>

          {/* Step 1: Registration */}
          {step === 'register' && (
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-2 text-center">
                Создать аккаунт
              </h2>
              <p className="text-body text-deep-navy/70 mb-6 text-center">
                Зарегистрируйтесь, чтобы сохранять результаты квизов и общаться с Евой
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-deep-navy mb-2">
                    Логин
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError(null)
                    }}
                    placeholder="придумайте_логин"
                    className="w-full px-4 py-3 bg-white border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple transition-colors text-deep-navy placeholder:text-deep-navy/50"
                    autoFocus
                    required
                  />
                  <p className="text-xs text-deep-navy/60 mt-1">
                    Только буквы, цифры и подчеркивание
                  </p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-deep-navy mb-2">
                    Пароль
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError(null)
                    }}
                    placeholder="минимум 6 символов"
                    className="w-full px-4 py-3 bg-white border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple transition-colors text-deep-navy placeholder:text-deep-navy/50"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-deep-navy mb-2">
                    Подтвердите пароль
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError(null)
                    }}
                    placeholder="введите пароль еще раз"
                    className="w-full px-4 py-3 bg-white border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple transition-colors text-deep-navy placeholder:text-deep-navy/50"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-error text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Регистрация...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      <span>Зарегистрироваться</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Link Telegram */}
          {step === 'link-telegram' && (
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-2 text-center">
                Привяжите Telegram
              </h2>
              <p className="text-body text-deep-navy/70 mb-6 text-center">
                Чтобы общаться с Евой, привяжите ваш Telegram аккаунт
              </p>

              {linkCode && (
                <div className="bg-primary-purple/10 border-2 border-primary-purple/20 rounded-2xl p-6 mb-6">
                  <p className="text-sm text-deep-navy/70 mb-3 text-center">
                    Скопируйте код и откройте бота:
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 bg-white rounded-xl p-4 border-2 border-primary-purple/30">
                      <p className="text-2xl font-bold text-primary-purple text-center font-mono">
                        {linkCode}
                      </p>
                    </div>
                    <button
                      onClick={copyCode}
                      className="p-3 bg-primary-purple text-white rounded-xl hover:bg-primary-purple/90 transition-colors"
                      title="Скопировать код"
                    >
                      {codeCopied ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <a
                    href={deepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Открыть бота</span>
                  </a>
                  <p className="text-xs text-deep-navy/60 mt-3 text-center">
                    Бот автоматически обработает код и привяжет ваш аккаунт
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={skipTelegramLink}
                  className="flex-1 text-sm text-deep-navy/60 hover:text-deep-navy transition-colors"
                >
                  Пропустить (можно привязать позже)
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-4">
                Регистрация успешна!
              </h2>
              <p className="text-body text-deep-navy/70">
                Перенаправляем в личный кабинет...
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

