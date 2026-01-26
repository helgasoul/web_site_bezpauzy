'use client'

import { FC, useEffect, useState } from 'react'
import { Download, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface BookPurchaseStatusProps {
  email: string | null
}

interface PurchaseStatus {
  purchased: boolean
  canDownload?: boolean
  downloadCount?: number
  maxDownloads?: number
  expiresAt?: string
  isExpired?: boolean
  limitReached?: boolean
  downloadToken?: string
  purchaseId?: string
}

export const BookPurchaseStatus: FC<BookPurchaseStatusProps> = ({ email }) => {
  const [status, setStatus] = useState<PurchaseStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!email) {
      // Пытаемся получить email из localStorage (сохраненный после покупки)
      const savedEmail = localStorage.getItem('purchase_email')
      if (savedEmail) {
        checkPurchaseStatus(savedEmail)
      }
      return
    }

    checkPurchaseStatus(email)
  }, [email])

  const checkPurchaseStatus = async (userEmail: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/book/purchase-status?email=${encodeURIComponent(userEmail)}`
      )

      if (!response.ok) {
        throw new Error('Ошибка при проверке статуса покупки')
      }

      const data = await response.json()
      setStatus(data)
    } catch (err: any) {
      console.error('Error checking book purchase status:', err)
      setError(err.message || 'Ошибка при проверке статуса покупки')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (status?.downloadToken) {
      window.location.href = `/api/book/download/${status.downloadToken}`
    }
  }

  // Не показываем ничего, если загрузка и нет статуса
  if (isLoading && !status) {
    return null
  }

  // Не показываем, если книга не куплена
  if (!status?.purchased) {
    return null
  }

  // Если можно скачать
  if (status.canDownload) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-h5 font-semibold text-green-900 mb-2">
              Книга куплена
            </h3>
            <p className="text-body-small text-green-800 mb-4">
              Вы можете скачать книгу. Осталось скачиваний:{' '}
              <strong>
                {status.maxDownloads! - status.downloadCount!} из {status.maxDownloads}
              </strong>
            </p>
            {status.expiresAt && (
              <p className="text-xs text-green-700 mb-4">
                Срок действия ссылки до:{' '}
                {new Date(status.expiresAt).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Скачать книгу
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Если лимит достигнут
  if (status.limitReached) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-h5 font-semibold text-yellow-900 mb-2">
              Достигнут лимит скачиваний
            </h3>
            <p className="text-body-small text-yellow-800">
              Вы уже скачали книгу {status.downloadCount} раз(а) из {status.maxDownloads} доступных.
              Если вам нужна помощь, свяжитесь с нами.
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  // Если срок действия истек
  if (status.isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6"
      >
        <div className="flex items-start gap-4">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-h5 font-semibold text-red-900 mb-2">
              Срок действия ссылки истек
            </h3>
            <p className="text-body-small text-red-800">
              Срок действия ссылки для скачивания истек. Если вам нужна помощь, свяжитесь с нами.
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}

