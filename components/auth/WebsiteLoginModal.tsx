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
        console.log('[WebsiteLoginModal] Response status:', response.status)
        console.log('[WebsiteLoginModal] Response text:', text.substring(0, 200))
        
        if (!text) {
          console.error('[WebsiteLoginModal] Empty response from server')
          throw new Error('Пустой ответ от сервера. Попробуйте еще раз.')
        }
        
        try {
          data = JSON.parse(text)
        } catch (jsonError) {
          console.error('[WebsiteLoginModal] Failed to parse JSON:', jsonError)
          console.error('[WebsiteLoginModal] Response text was:', text)
          // Если ответ не JSON, возможно это HTML-страница с ошибкой
          if (text.includes('<html') || text.includes('<!DOCTYPE')) {
            throw new Error('Сервер вернул неожиданный формат ответа. Пожалуйста, обновите страницу и попробуйте снова.')
          }
          throw new Error('Неверный формат ответа от сервера. Попробуйте еще раз.')
        }
      } catch (parseError) {
        console.error('[WebsiteLoginModal] Error parsing response:', parseError)
        const errorMessage = parseError instanceof Error 
          ? parseError.message 
          : 'Ошибка при обработке ответа от сервера'
        throw new Error(errorMessage)
      }


      if (!response.ok) {
        // Если пользователь не найден, предлагаем зарегистрироваться
        if (data.error?.includes('Неверный логин') || data.error?.includes('не найден')) {
          setError('Пользователь с таким логином не найден. Хотите зарегистрироваться?')
        } else {
          throw new Error(data.error || 'Ошибка при входе')
        }
        return
      }

      // Успешный вход - проверяем сессию и вызываем onSuccess
      console.log('[WebsiteLoginModal] Login successful, checking session...')
      setLoading(false)
      
      // Проверяем, что cookie установилась перед вызовом onSuccess (максимум 5 попыток)
      let retryCount = 0
      const maxRetries = 5
      const retryDelay = 800
      
      const checkSessionAndProceed = async () => {
        try {
          console.log(`[WebsiteLoginModal] Session check attempt ${retryCount + 1}/${maxRetries}`)
          const sessionCheck = await fetch('/api/auth/telegram/get-session', {
            credentials: 'include',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
            },
          })
          
          if (!sessionCheck.ok) {
            throw new Error(`HTTP error! status: ${sessionCheck.status}`)
          }
          
          const sessionData = await sessionCheck.json()
          console.log(`[WebsiteLoginModal] Session check result:`, sessionData)
          
          if (sessionData.authenticated) {
            // Сессия подтверждена, закрываем модалку и вызываем onSuccess
            console.log('[WebsiteLoginModal] Session authenticated, calling onSuccess')
            onClose()
            setTimeout(() => {
              onSuccess()
            }, 200)
          } else if (retryCount < maxRetries - 1) {
            console.log(`[WebsiteLoginModal] Session not authenticated, retrying in ${retryDelay}ms... Error:`, sessionData.error)
            retryCount++
            setTimeout(checkSessionAndProceed, retryDelay)
          } else {
            // После всех попыток все равно закрываем модалку и вызываем onSuccess
            console.warn(`[WebsiteLoginModal] All ${maxRetries} attempts failed, but proceeding anyway. Error:`, sessionData.error)
            onClose()
            setTimeout(() => {
              onSuccess()
            }, 200)
          }
        } catch (error: any) {
          console.error(`[WebsiteLoginModal] Error on attempt ${retryCount + 1}:`, error)
          if (retryCount < maxRetries - 1) {
            retryCount++
            setTimeout(checkSessionAndProceed, retryDelay)
          } else {
            console.warn(`[WebsiteLoginModal] All ${maxRetries} attempts failed with errors, but proceeding anyway`)
            onClose()
            setTimeout(() => {
              onSuccess()
            }, 200)
          }
        }
      }
      
      // Начинаем проверку с задержкой, чтобы дать время cookie установиться
      setTimeout(checkSessionAndProceed, 600)
      
      return
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-deep-navy/60 backdrop-blur-sm pointer-events-auto"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-8 md:p-10 z-10 pointer-events-auto"
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

