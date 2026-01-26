'use client'

import { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Download, Loader2, AlertCircle, BookOpen, Mail, Calendar, Gift } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface BookPurchaseSuccessClientProps {
  orderId: string | null
  isTest?: boolean
}

interface PurchaseData {
  id: string
  resourceTitle: string
  downloadToken: string | null
  downloadCount: number
  maxDownloads: number
  expiresAt: string | null
  bookType: 'digital' | 'physical'
}

export const BookPurchaseSuccessClient: FC<BookPurchaseSuccessClientProps> = ({
  orderId,
  isTest = false,
}) => {
  const router = useRouter()
  const [purchase, setPurchase] = useState<PurchaseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (!orderId) {
      setError('ID заказа не указан')
      setIsLoading(false)
      return
    }

    // В тестовом режиме автоматически помечаем заказ как оплаченный
    if (isTest) {
      fetch(`/api/book/purchase/${orderId}/mark-paid`, {
        method: 'POST',
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('✅ [BookPurchaseSuccess] Заказ помечен как оплаченный (тест):', data)
        })
        .catch((err) => {
          console.error('❌ [BookPurchaseSuccess] Ошибка при пометке заказа:', err)
        })
    }

    // Получаем информацию о заказе
    fetch(`/api/book/purchase/${orderId}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Заказ не найден')
          }
          if (res.status === 403) {
            throw new Error('Оплата не завершена')
          }
          throw new Error('Ошибка при получении информации о заказе')
        }
        return res.json()
      })
      .then((data) => {
        console.log('✅ [BookPurchaseSuccess] Данные заказа получены:', data)
        setPurchase(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('❌ [BookPurchaseSuccess] Ошибка:', err)
        setError(err.message || 'Ошибка при получении информации о заказе')
        setIsLoading(false)
      })
  }, [orderId, isTest])

  const handleDownload = () => {
    if (!purchase?.downloadToken) {
      setError('Токен для скачивания не найден')
      return
    }

    setIsDownloading(true)
    // Редирект на API route для скачивания
    window.location.href = `/api/book/download/${purchase.downloadToken}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center"
        >
          <Loader2 className="w-12 h-12 text-primary-purple animate-spin mx-auto mb-4" />
          <p className="text-body text-deep-navy">Загрузка информации о заказе...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-h3 font-bold text-deep-navy mb-2">Ошибка</h2>
          <p className="text-body text-deep-navy/70 mb-6">{error || 'Заказ не найден'}</p>
          <Link
            href="/book"
            className="inline-block bg-primary-purple text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-purple/90 transition-colors"
          >
            Вернуться к книге
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full"
      >
        {/* Success Icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          <h1 className="text-h2 md:text-h1 font-bold text-deep-navy mb-2">
            Спасибо за покупку!
          </h1>
          <p className="text-body-large text-deep-navy/70">
            Ваш заказ успешно оплачен
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-lavender-bg rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-body-small text-deep-navy/70 mb-1">Книга</p>
              <p className="text-body font-semibold text-deep-navy">
                {purchase.resourceTitle || 'Менопауза: Новое видение'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-body-small text-deep-navy/70 mb-1">Тип издания</p>
              <p className="text-body font-semibold text-deep-navy">
                Электронная версия (EPUB)
              </p>
            </div>
          </div>

          {purchase.downloadToken && (
            <>
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-body-small text-deep-navy/70 mb-1">Скачивания</p>
                  <p className="text-body font-semibold text-deep-navy">
                    {purchase.downloadCount} / {purchase.maxDownloads || '∞'}
                  </p>
                </div>
              </div>

              {purchase.expiresAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-body-small text-deep-navy/70 mb-1">Срок действия</p>
                    <p className="text-body font-semibold text-deep-navy">
                      {new Date(purchase.expiresAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bonus Info */}
        <div className="bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10 rounded-2xl p-6 mb-6 border border-primary-purple/20">
          <div className="flex items-start gap-3">
            <Gift className="w-6 h-6 text-primary-purple flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-h5 font-semibold text-deep-navy mb-2">
                🎁 Бонус: 1 месяц Paid1 в подарок
              </h3>
              <p className="text-body-small text-deep-navy/70 mb-4">
                Доступ к премиум-функциям бота &quot;Ева&quot; активирован автоматически.
              </p>
              <Link
                href="https://t.me/bezpauzy_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-purple hover:text-ocean-wave-start font-semibold transition-colors"
              >
                Открыть бота Еву →
              </Link>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {purchase.downloadToken && (
            <motion.button
              onClick={handleDownload}
              disabled={isDownloading}
              whileHover={{ scale: isDownloading ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-4 rounded-full font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Подготовка скачивания...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Скачать книгу</span>
                </>
              )}
            </motion.button>
          )}

          <Link
            href="/book"
            className="block w-full text-center bg-white border-2 border-primary-purple text-primary-purple px-6 py-4 rounded-full font-semibold text-base hover:bg-primary-purple/5 transition-colors"
          >
            Вернуться к книге
          </Link>
        </div>

        {/* Email Info */}
        <div className="mt-6 pt-6 border-t border-lavender-bg text-center">
          <div className="flex items-center justify-center gap-2 text-body-small text-deep-navy/70">
            <Mail className="w-4 h-4" />
            <p>
              Ссылка для скачивания также отправлена на ваш email
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

