'use client'

import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, AlertCircle, User, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WebsiteLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onSwitchToRegister?: () => void
}

export const WebsiteLoginModal: FC<WebsiteLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToRegister,
}) => {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Введите логин и пароль')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/website/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      // Проверяем, что ответ валидный JSON
      let data
      try {
        const text = await response.text()
        if (!text) {
          throw new Error('Пустой ответ от сервера')
        }
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        throw new Error('Ошибка при обработке ответа от сервера')
      }

      // Логируем ответ для отладки
      console.log('Login response:', { ok: response.ok, status: response.status, data })

      if (!response.ok) {
        // Если пользователь не найден, предлагаем зарегистрироваться
        if (data.error?.includes('Неверный логин') || data.error?.includes('не найден')) {
          setError('Пользователь с таким логином не найден. Хотите зарегистрироваться?')
        } else {
          throw new Error(data.error || 'Ошибка при входе')
        }
        return
      }

      // Успешный вход - перенаправляем в личный кабинет
      console.log('Login successful, redirecting to /account', data)
      
      // Сбрасываем состояние загрузки
      setLoading(false)
      
      // Закрываем модальное окно
      onClose()
      
      // Проверяем, что cookie установилась перед редиректом
      // Используем более длинную задержку, чтобы cookie точно успела установиться
      setTimeout(async () => {
        console.log('Checking session before redirect...')
        try {
          // Проверяем сессию перед редиректом
          const sessionCheck = await fetch('/api/auth/telegram/get-session', {
            credentials: 'include',
            cache: 'no-store'
          })
          const sessionData = await sessionCheck.json()
          console.log('Session check before redirect:', sessionData)
          
          if (sessionData.authenticated) {
            console.log('Session confirmed, redirecting to /account')
            window.location.href = '/account'
          } else {
            console.warn('Session not found, but redirecting anyway (cookie may be delayed)')
            window.location.href = '/account'
          }
        } catch (error) {
          console.error('Error checking session before redirect:', error)
          // Все равно делаем редирект
          window.location.href = '/account'
        }
      }, 1000) // Увеличиваем задержку до 1 секунды
      
      return // Важно: выходим из функции
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading && username && password) {
      handleLogin()
    }
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
          onClick={onClose}
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
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-deep-navy/60 hover:text-deep-navy transition-colors"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-h3 font-bold text-deep-navy mb-2 text-center">
            Вход на сайт
          </h2>
          <p className="text-body text-deep-navy/70 mb-6 text-center">
            Введите ваш логин и пароль
          </p>

          {/* Form */}
          <div className="space-y-4">
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
                onKeyPress={handleKeyPress}
                placeholder="Ваш логин"
                className="w-full px-4 py-3 bg-white border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple transition-colors text-deep-navy placeholder:text-deep-navy/50"
                autoFocus
                disabled={loading}
              />
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
                onKeyPress={handleKeyPress}
                placeholder="Ваш пароль"
                className="w-full px-4 py-3 bg-white border-2 border-lavender-bg rounded-xl focus:outline-none focus:border-primary-purple transition-colors text-deep-navy placeholder:text-deep-navy/50"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-error text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
                {error.includes('не найден') && onSwitchToRegister && (
                  <button
                    onClick={() => {
                      onClose()
                      onSwitchToRegister()
                    }}
                    className="w-full bg-white border-2 border-primary-purple text-primary-purple px-6 py-3 rounded-xl font-semibold hover:bg-primary-purple hover:text-white transition-all duration-300"
                  >
                    Зарегистрироваться
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !username || !password}
              className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Вход...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Войти</span>
                </>
              )}
            </button>

            <div className="text-center">
              <button
                onClick={() => {
                  if (onSwitchToRegister) {
                    onClose()
                    onSwitchToRegister()
                  }
                }}
                className="text-sm text-deep-navy/60 hover:text-deep-navy transition-colors"
              >
                Нет аккаунта? Зарегистрируйтесь
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

