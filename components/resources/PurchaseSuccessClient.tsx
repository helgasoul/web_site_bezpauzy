'use client'

import { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, Download, ArrowRight, Loader2, AlertCircle, Mail, ShoppingBag, Gift } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'
import { formatPrice } from '@/lib/utils/format'

interface PurchaseSuccessClientProps {
  orderId?: string
  isTest?: boolean
}

interface PurchaseData {
  id: string
  resourceTitle: string
  downloadToken: string
  downloadCount: number
  maxDownloads: number
  expiresAt: string
}

interface CartOrderData {
  orderId: string
  orderNumber: string | null
  email: string
  name: string
  items: Array<{
    type: 'book' | 'resource'
    id: string
    title: string
    amount_kopecks: number
    order_number?: string
  }>
  totalAmountKopecks: number
  createdAt: string
}

export const PurchaseSuccessClient: FC<PurchaseSuccessClientProps> = ({
  orderId,
  isTest = false,
}) => {
  const [purchase, setPurchase] = useState<PurchaseData | null>(null)
  const [cartOrder, setCartOrder] = useState<CartOrderData | null>(null)
  const [loading, setLoading] = useState(!!orderId)
  const [error, setError] = useState<string | null>(null)
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    if (!orderId) {
      setError('ID заказа не указан')
      setLoading(false)
      return
    }

    const ensurePaidInDev = async () => {
      if (!isTest) return
      try {
        await fetch(`/api/resources/purchase/${orderId}/mark-paid`, { method: 'POST' })
      } catch {
        // ignore dev helper failures
      }
    }

    // Загружаем информацию о покупке
    const fetchPurchase = async () => {
      try {
        await ensurePaidInDev()
        
        // Сначала пробуем получить как заказ из корзины
        const cartResponse = await fetch(`/api/cart/order/${orderId}`)
        if (cartResponse.ok) {
          const cartData = await cartResponse.json()
          // Если это заказ из корзины (больше одного товара или это заказ из корзины)
          if (cartData.items && cartData.items.length > 0) {
            setCartOrder(cartData)
            
            // Очищаем корзину после подтверждения заказа
            // clearCart() автоматически синхронизирует с сервером через _internalSync()
            try {
              clearCart()
              // Дополнительно очищаем на сервере напрямую (на случай, если debounce не сработал)
              setTimeout(async () => {
                try {
                  await fetch('/api/cart/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ items: [] }),
                  })
                  console.log('✅ [PurchaseSuccess] Корзина очищена на сервере')
                } catch (e) {
                  // Игнорируем ошибки
                }
              }, 1000) // Даем время для debounce в _internalSync
              console.log('✅ [PurchaseSuccess] Корзина очищена')
            } catch (clearError) {
              console.warn('⚠️ [PurchaseSuccess] Ошибка очистки корзины:', clearError)
              // Не критично, продолжаем
            }
            
            setLoading(false)
            return
          }
        }

        // Если не заказ из корзины, пробуем как отдельный ресурс
        const response = await fetch(`/api/resources/purchase/${orderId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Ошибка при загрузке данных')
        }

        setPurchase(data)
      } catch (err: any) {
        setError(err.message || 'Ошибка при загрузке данных')
      } finally {
        setLoading(false)
      }
    }

    fetchPurchase()
  }, [orderId, isTest, clearCart])

  const handleDownload = () => {
    if (purchase?.downloadToken) {
      window.location.href = `/download/guide/${purchase.downloadToken}`
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          {isTest && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-semibold mb-1">
                    Тестовый режим
                  </p>
                  <p className="text-xs text-yellow-700">
                    Это тестовая страница. В реальной оплате здесь будет информация о вашей покупке.
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-3xl shadow-card p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary-purple mx-auto mb-4" />
              <p className="text-body text-deep-navy/70">Загрузка информации...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl shadow-card p-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-h2 font-bold text-deep-navy mb-4">Ошибка</h1>
              <p className="text-body text-deep-navy/70 mb-6">{error}</p>
              <Link
                href="/resources/guides"
                className="inline-flex items-center gap-2 text-primary-purple hover:text-ocean-wave-start font-medium"
              >
                Вернуться к гайдам
              </Link>
            </div>
          ) : cartOrder ? (
            // Заказ из корзины
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card p-8 md:p-12"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full mb-6 mx-auto flex"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>

              {/* Title */}
              <h1 className="text-h2 md:text-h1 font-bold text-deep-navy mb-4 text-center">
                Ваш заказ принят! 🎉
              </h1>

              <p className="text-body-large text-deep-navy/70 mb-8 text-center">
                Спасибо за вашу покупку, {cartOrder.name}! Мы рады, что вы выбрали нас для поддержки вашего здоровья.
              </p>

              {/* Order Number */}
              {cartOrder.orderNumber && (
                <div className="bg-gradient-to-r from-primary-purple/10 to-ocean-wave-start/10 rounded-2xl p-6 mb-6 text-center border-2 border-primary-purple/20">
                  <p className="text-body-small text-deep-navy/60 mb-2">Номер заказа</p>
                  <p className="text-h4 font-bold text-primary-purple">{cartOrder.orderNumber}</p>
                </div>
              )}

              {/* Purchased Items */}
              <div className="bg-lavender-bg rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-primary-purple" />
                  <h2 className="text-h5 font-bold text-deep-navy">Ваши покупки:</h2>
                </div>
                <div className="space-y-3">
                  {cartOrder.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-white rounded-xl p-4 border border-lavender-bg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-purple/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {item.type === 'book' ? (
                            <Gift className="w-5 h-5 text-primary-purple" />
                          ) : (
                            <Download className="w-5 h-5 text-primary-purple" />
                          )}
                        </div>
                        <div>
                          <p className="text-body font-semibold text-deep-navy">{item.title}</p>
                          <p className="text-body-small text-deep-navy/60">
                            {item.type === 'book' ? 'Книга' : 'Гайд'}
                          </p>
                        </div>
                      </div>
                      <p className="text-body font-bold text-primary-purple">
                        {formatPrice(item.amount_kopecks / 100)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t-2 border-primary-purple/20 flex justify-between items-center">
                  <span className="text-h5 font-bold text-deep-navy">Итого:</span>
                  <span className="text-h3 font-bold text-primary-purple">
                    {formatPrice(cartOrder.totalAmountKopecks / 100)}
                  </span>
                </div>
              </div>

              {/* Email Info */}
              <div className="bg-gradient-to-r from-primary-purple/5 to-ocean-wave-start/5 rounded-2xl p-6 mb-6 border border-primary-purple/10">
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-primary-purple flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-body font-semibold text-deep-navy mb-2">
                      Ссылки для скачивания отправлены на вашу почту
                    </p>
                    <p className="text-body-small text-deep-navy/70 mb-2">
                      Мы отправили письмо на <strong>{cartOrder.email}</strong> со всеми ссылками для скачивания ваших покупок.
                    </p>
                    <p className="text-body-small text-deep-navy/60">
                      Пожалуйста, проверьте папку «Входящие» или «Спам». Каждая ссылка действительна 30 дней, и вы можете скачать файлы до 3 раз.
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="text-center space-y-4">
                <p className="text-body text-deep-navy/70">
                  Если у вас возникнут вопросы или нужна помощь, мы всегда готовы помочь. 
                  Напишите нам на{' '}
                  <a
                    href="mailto:bez-pauzy@yandex.com"
                    className="text-primary-purple hover:text-ocean-wave-start underline font-medium"
                  >
                    bez-pauzy@yandex.com
                  </a>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full font-semibold hover:shadow-lg transition-all"
                  >
                    Посмотреть другие товары
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-lavender-bg text-primary-purple rounded-full font-semibold hover:bg-primary-purple/10 transition-all"
                  >
                    На главную
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : purchase ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card p-8 md:p-12 text-center"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-purple to-ocean-wave-start rounded-full mb-6"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>

              {/* Title */}
              <h1 className="text-h2 md:text-h1 font-bold text-deep-navy mb-4">
                Спасибо за покупку! 🎉
              </h1>

              <p className="text-body-large text-deep-navy/70 mb-8">
                Ваш гайд <strong>{purchase.resourceTitle}</strong> готов к скачиванию
              </p>

              {/* Download Button */}
              <motion.button
                onClick={handleDownload}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto mb-6"
              >
                <Download className="w-6 h-6" />
                <span>Скачать гайд</span>
              </motion.button>

              {/* Info */}
              <div className="bg-lavender-bg rounded-2xl p-6 space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-body text-deep-navy/70">Срок действия ссылки:</span>
                  <span className="text-body font-semibold text-deep-navy">
                    {formatDate(purchase.expiresAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body text-deep-navy/70">Скачиваний использовано:</span>
                  <span className="text-body font-semibold text-deep-navy">
                    {purchase.downloadCount} / {purchase.maxDownloads}
                  </span>
                </div>
                <div className="pt-3 border-t border-primary-purple/20">
                  <p className="text-sm text-deep-navy/60">
                    Ссылка для скачивания также отправлена на ваш email. Вы можете скачать гайд до{' '}
                    <strong>{purchase.maxDownloads} раз</strong> в течение{' '}
                    <strong>30 дней</strong>.
                  </p>
                </div>
              </div>

              {/* Back Link */}
              <div className="mt-8">
                <Link
                  href="/resources/guides"
                  className="inline-flex items-center gap-2 text-primary-purple hover:text-ocean-wave-start font-medium"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Вернуться к гайдам
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl shadow-card p-12 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-h2 font-bold text-deep-navy mb-4">Заказ не найден</h1>
              <p className="text-body text-deep-navy/70 mb-6">
                Не удалось найти информацию о вашем заказе.
              </p>
              <Link
                href="/resources/guides"
                className="inline-flex items-center gap-2 text-primary-purple hover:text-ocean-wave-start font-medium"
              >
                Вернуться к гайдам
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

