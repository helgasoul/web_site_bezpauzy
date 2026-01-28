'use client'

import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bot, ExternalLink, Loader2, AlertCircle, Copy, Check, FileText } from 'lucide-react'
import Link from 'next/link'

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
  const [consentGiven, setConsentGiven] = useState(false)
  const [showConsentForm, setShowConsentForm] = useState(true)

  useEffect(() => {
    if (isOpen) {
      // Сбрасываем состояние при открытии
      setLinkCode('')
      setDeepLink('')
      setError(null)
      setConsentGiven(false)
      setShowConsentForm(true)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const generateLinkCode = async () => {
    if (!consentGiven) {
      setError('Необходимо дать согласие на обработку персональных данных')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/link-telegram/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consentGiven: true }),
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
      setShowConsentForm(false)
      
      // Определяем формат ссылки в зависимости от устройства
      // На мобильных устройствах лучше использовать tg:// протокол
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      // Используем нативный формат, если он доступен и мы на мобильном
      const finalDeepLink = (isMobile && data.nativeDeepLink) 
        ? data.nativeDeepLink
        : data.deepLink
      
      setDeepLink(finalDeepLink)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании кода')
    } finally {
      setLoading(false)
    }
  }

  const handleConsentAccept = () => {
    if (consentGiven) {
      generateLinkCode()
    } else {
      setError('Необходимо дать согласие на обработку персональных данных')
    }
  }

  const handleConsentDecline = () => {
    onClose()
  }

  const handleClose = () => {
    setLinkCode('')
    setDeepLink('')
    setError(null)
    setConsentGiven(false)
    setShowConsentForm(true)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-8 overflow-y-auto">
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
          className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 z-10 my-auto"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-deep-navy/60 hover:text-deep-navy transition-colors"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>

          {/* Форма согласия */}
          {showConsentForm ? (
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

              {/* Согласие на обработку данных */}
              <div className="bg-lavender-bg/50 border border-primary-purple/20 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary-purple border-deep-navy/30 rounded focus:ring-primary-purple focus:ring-2"
                  />
                  <label htmlFor="consent" className="flex-1 text-sm text-deep-navy/80 cursor-pointer">
                    Я даю согласие на{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-purple hover:text-ocean-wave-start underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      обработку персональных данных
                    </Link>
                    {' '}и согласен с{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-purple hover:text-ocean-wave-start underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      политикой конфиденциальности
                    </Link>
                  </label>
                </div>
                
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary-purple hover:text-ocean-wave-start transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ознакомиться с политикой конфиденциальности</span>
                </Link>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConsentAccept}
                  disabled={!consentGiven || loading}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Создаем код...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5" />
                      <span>Согласиться и привязать</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleConsentDecline}
                  disabled={loading}
                  className="w-full text-sm text-deep-navy/60 hover:text-deep-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Отказаться
                </button>
              </div>
            </div>
          ) : loading ? (
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
                <p className="text-sm text-deep-navy/70 mb-4 text-center">
                  Нажмите кнопку ниже, чтобы открыть бота и автоматически привязать ваш Telegram аккаунт:
                </p>
                <a
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    console.log('[TelegramLinkModal] Link clicked:', deepLink)
                    console.log('[TelegramLinkModal] Code:', linkCode)
                    // Для мобильных устройств можно попробовать открыть через tg:// напрямую
                    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                      const tgLink = deepLink.includes('tg://') 
                        ? deepLink 
                        : deepLink.replace('https://t.me/', 'tg://resolve?domain=').replace('?start=', '&start=')
                      
                      console.log('[TelegramLinkModal] Mobile detected, using tg:// link:', tgLink)
                      // Пробуем открыть через tg://, если не получится - откроется обычная ссылка
                      try {
                        window.location.href = tgLink
                        e.preventDefault()
                      } catch (err) {
                        console.log('[TelegramLinkModal] Failed to open tg://, using https://')
                      }
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 mb-4"
                >
                  <Bot className="w-5 h-5" />
                  <span>Привязать Telegram</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
                
                {/* Альтернативный способ: копирование кода */}
                <div className="border-t border-primary-purple/20 pt-4 mt-4">
                  <p className="text-xs text-deep-navy/60 mb-2 text-center">
                    Или скопируйте код и отправьте боту сообщение:
                  </p>
                  <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-primary-purple/20">
                    <code className="flex-1 text-center font-mono text-lg font-bold text-primary-purple">
                      link_{linkCode}
                    </code>
                    <button
                      onClick={async () => {
                        const command = `link_${linkCode}`
                        try {
                          await navigator.clipboard.writeText(command)
                          setCodeCopied(true)
                          setTimeout(() => setCodeCopied(false), 2000)
                        } catch (err) {
                          console.error('Failed to copy:', err)
                        }
                      }}
                      className="p-2 hover:bg-primary-purple/10 rounded-lg transition-colors"
                      title="Скопировать код"
                    >
                      {codeCopied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-primary-purple" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-deep-navy/50 mt-2 text-center">
                    Откройте бота и отправьте это сообщение (можно без /start)
                  </p>
                </div>
                
                <p className="text-xs text-deep-navy/60 text-center mt-4">
                  Бот автоматически обработает привязку. После этого вернитесь на сайт.
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

