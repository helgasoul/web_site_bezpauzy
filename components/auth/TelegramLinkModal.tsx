'use client'

import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bot, Copy, CheckCircle2, ExternalLink, Loader2, AlertCircle } from 'lucide-react'

interface TelegramLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const TelegramLinkModal: FC<TelegramLinkModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [linkCode, setLinkCode] = useState('')
  const [deepLink, setDeepLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Сбрасываем состояние при открытии
      setLinkCode('')
      setDeepLink('')
      setError(null)
      setCodeCopied(false)
      setLoading(true)
      // Генерируем новый код
      generateLinkCode()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const generateLinkCode = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/link-telegram/generate-code', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось создать код')
      }

      if (data.alreadyLinked) {
        // Уже привязан
        onSuccess?.()
        onClose()
        return
      }

      setLinkCode(data.code)
      setDeepLink(data.deepLink)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании кода')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(linkCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setLinkCode('')
    setDeepLink('')
    setError(null)
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

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-primary-purple animate-spin mx-auto mb-4" />
              <p className="text-body text-deep-navy/70">Создаем код привязки...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-2">Ошибка</h2>
              <p className="text-body text-deep-navy/70 mb-6">{error}</p>
              <button
                onClick={generateLinkCode}
                className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Попробовать снова
              </button>
            </div>
          ) : linkCode ? (
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-2 text-center">
                Привяжите Telegram
              </h2>
              <p className="text-body text-deep-navy/70 mb-6 text-center">
                Чтобы общаться с Евой, привяжите ваш Telegram аккаунт
              </p>

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
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 mb-3"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Открыть бота</span>
                </a>
                <p className="text-xs text-deep-navy/60 text-center">
                  Бот автоматически обработает код и привяжет ваш аккаунт. После этого вернитесь на сайт.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full text-sm text-deep-navy/60 hover:text-deep-navy transition-colors"
              >
                Закрыть (можно привязать позже)
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-h3 font-bold text-deep-navy mb-2">
                Привяжите Telegram
              </h2>
              <p className="text-body text-deep-navy/70 mb-6">
                Чтобы общаться с Евой, привяжите ваш Telegram аккаунт
              </p>
              <p className="text-sm text-deep-navy/60 mb-6">
                Не удалось создать код привязки. Попробуйте еще раз.
              </p>
              <button
                onClick={generateLinkCode}
                className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 mb-3"
              >
                Попробовать снова
              </button>
              <button
                onClick={handleClose}
                className="w-full text-sm text-deep-navy/60 hover:text-deep-navy transition-colors"
              >
                Закрыть (можно привязать позже)
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

