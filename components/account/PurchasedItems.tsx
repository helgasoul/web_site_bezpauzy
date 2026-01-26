'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Book, FileText, ExternalLink, Clock, CheckCircle2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils/format'

interface PurchasedItem {
  id: string
  type: 'book' | 'resource'
  title: string
  description: string | null
  thumbnail_url: string | null
  slug: string | null
  orderNumber: string | null
  purchaseDate: string
  downloadToken: string | null
  downloadUrl: string | null
  expiresAt: string | null
  priceKopecks: number
  downloadCount: number
  maxDownloads: number
}

interface PurchasedItemsProps {}

export const PurchasedItems: FC<PurchasedItemsProps> = () => {
  const [purchases, setPurchases] = useState<PurchasedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/account/purchases', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Необходима авторизация')
        } else {
          throw new Error('Не удалось загрузить покупки')
        }
        return
      }
      
      const data = await response.json()
      setPurchases(data.purchases || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const canDownload = (item: PurchasedItem) => {
    if (!item.downloadUrl || !item.downloadToken) return false
    if (isExpired(item.expiresAt || '')) return false
    if (item.downloadCount >= item.maxDownloads) return false
    return true
  }

  const handleDownload = (item: PurchasedItem) => {
    if (item.downloadUrl && canDownload(item)) {
      window.open(item.downloadUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-purple mx-auto mb-4" />
        <p className="text-body text-deep-navy/70">Загрузка ваших покупок...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 text-center">
        <p className="text-body text-deep-navy/70">{error}</p>
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-12 text-center">
        <div className="w-16 h-16 bg-lavender-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <Book className="w-8 h-8 text-primary-purple/50" />
        </div>
        <h3 className="text-h5 font-semibold text-deep-navy mb-2">У вас пока нет покупок</h3>
        <p className="text-body text-deep-navy/70 mb-6">
          После покупки товары автоматически появятся здесь с доступными ссылками для скачивания
        </p>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-lg transition-all"
        >
          Посмотреть товары
          <ExternalLink className="w-5 h-5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {purchases.map((item, index) => {
        const expired = isExpired(item.expiresAt || '')
        const canDownloadItem = canDownload(item)

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-card p-6 border border-lavender-bg hover:shadow-card-hover transition-all"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Thumbnail */}
              {item.thumbnail_url && (
                <div className="relative w-full md:w-32 md:h-32 rounded-xl overflow-hidden bg-lavender-bg flex-shrink-0">
                  <Image
                    src={item.thumbnail_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 128px"
                  />
                  <div className="absolute top-2 right-2">
                    {item.type === 'book' ? (
                      <div className="w-8 h-8 bg-primary-purple rounded-full flex items-center justify-center">
                        <Book className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-ocean-wave-start rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-h5 font-semibold text-deep-navy mb-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-body-small text-deep-navy/60 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    {item.orderNumber && (
                      <p className="text-body-small text-deep-navy/50">
                        Заказ: <span className="font-semibold">{item.orderNumber}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-body-small text-deep-navy/70">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Куплено: {formatDate(item.purchaseDate)}</span>
                  </div>
                  {item.expiresAt && (
                    <div className={`flex items-center gap-1 ${expired ? 'text-red-500' : ''}`}>
                      <Clock className="w-4 h-4" />
                      <span>
                        {expired ? 'Срок действия истек' : `Действительно до: ${formatDate(item.expiresAt)}`}
                      </span>
                    </div>
                  )}
                  {item.maxDownloads > 1 && (
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>
                        Скачиваний: {item.downloadCount} / {item.maxDownloads}
                      </span>
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <div className="flex items-center gap-3">
                  {canDownloadItem ? (
                    <button
                      onClick={() => handleDownload(item)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-lg transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Скачать {item.type === 'book' ? 'книгу' : 'гайд'}
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-500 rounded-full font-semibold cursor-not-allowed">
                      <CheckCircle2 className="w-5 h-5" />
                      {expired
                        ? 'Срок действия истек'
                        : item.downloadCount >= item.maxDownloads
                        ? 'Лимит скачиваний исчерпан'
                        : 'Недоступно'}
                    </div>
                  )}
                  <div className="text-body font-semibold text-primary-purple">
                    {formatPrice(item.priceKopecks / 100)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
