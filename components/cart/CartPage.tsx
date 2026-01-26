'use client'

import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils/format'
import { validateEmail, normalizeEmail } from '@/lib/utils/validation'
import { CartUpsell } from './CartUpsell'

interface CartPageProps {}

export const CartPage: FC<CartPageProps> = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getItemCount, initializeCart } = useCartStore()
  
  // Инициализируем корзину при монтировании (загружает с сервера для авторизованных пользователей)
  useEffect(() => {
    initializeCart()
  }, [initializeCart])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [agreeToOffer, setAgreeToOffer] = useState(false)
  const [agreeToPrivacy, setAgreeToPrivacy] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const total = getTotal()
  const itemCount = getItemCount()

  const handleCheckout = async () => {
    if (items.length === 0) {
      console.log('⚠️ [CartPage] Корзина пуста')
      return
    }

    // Показываем форму если она еще не показана
    if (!showForm) {
      console.log('📝 [CartPage] Показываем форму оформления')
      setShowForm(true)
      return
    }

    // Валидация формы
    setError(null)

    if (!agreeToOffer) {
      setError('Необходимо согласиться с публичной офертой')
      return
    }

    if (!agreeToPrivacy) {
      setError('Необходимо согласиться на обработку персональных данных')
      return
    }

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Email обязателен')
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Некорректный формат email. Проверьте правильность ввода.')
      return
    }

    if (!name.trim()) {
      setError('Имя обязательно')
      return
    }

    // Нормализуем email перед отправкой
    const normalizedEmail = normalizeEmail(trimmedEmail)
    if (!normalizedEmail) {
      setError('Некорректный формат email')
      return
    }

    console.log('✅ [CartPage] Валидация прошла, отправляем запрос')
    setIsProcessing(true)
    setError(null)

    try {
      console.log('🛒 [CartPage] Отправка запроса на оформление заказа из корзины:', {
        itemsCount: items.length,
        email: normalizedEmail,
      })

      // Создаем заказ через API
      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          items: items,
          email: normalizedEmail,
          name: name.trim(),
          phone: phone.trim() || null,
        }),
      })

      console.log('📡 [CartPage] Ответ сервера:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      })

      const data = await response.json().catch((parseError) => {
        console.error('❌ [CartPage] Ошибка парсинга ответа:', parseError)
        throw new Error('Ошибка при обработке ответа сервера')
      })

      console.log('📦 [CartPage] Данные ответа:', {
        success: data.success,
        orderId: data.orderId,
        hasPaymentUrl: !!data.paymentUrl,
        paymentUrlPreview: data.paymentUrl ? data.paymentUrl.substring(0, 100) + '...' : 'НЕТ',
        error: data.error,
        warning: data.warning,
      })

      if (!response.ok) {
        const errorMsg = data.error || data.warning || 'Ошибка при оформлении заказа'
        console.error('❌ [CartPage] Ошибка ответа сервера:', errorMsg)
        throw new Error(errorMsg)
      }

      // Проверяем, что получили paymentUrl
      if (!data.paymentUrl) {
        throw new Error('Не получена ссылка на оплату. Проверьте логи сервера и убедитесь, что тестовые ключи ЮКассы правильно настроены.')
      }

      // Сохраняем email в localStorage для последующей проверки покупок
      try {
        localStorage.setItem('purchase_email', normalizedEmail)
      } catch (e) {
        console.warn('Не удалось сохранить email в localStorage:', e)
      }

      // Редирект на страницу оплаты ЮКассы
      console.log('🔄 [CartPage] Редирект на:', data.paymentUrl)
      
      // Валидация URL
      try {
        new URL(data.paymentUrl)
      } catch (urlError) {
        console.error('❌ [CartPage] Некорректный URL для редиректа:', data.paymentUrl)
        throw new Error('Некорректная ссылка на оплату. Попробуйте еще раз.')
      }
      
      setIsRedirecting(true)
      
      // Используем window.location.assign для более надежного редиректа
      window.location.assign(data.paymentUrl)
    } catch (err) {
      console.error('❌ [CartPage] Ошибка при оформлении заказа:', err)
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при оформлении заказа'
      console.error('❌ [CartPage] Текст ошибки для пользователя:', errorMessage)
      setError(errorMessage)
      setIsProcessing(false)
      setIsRedirecting(false)
    }
  }


  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-soft-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-lavender-bg rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-primary-purple/30" />
            </div>
            <h1 className="text-h1 font-bold text-deep-navy mb-4">Корзина пуста</h1>
            <p className="text-body-large text-deep-navy/70 mb-8">
              Добавьте товары в корзину, чтобы продолжить покупку
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-primary text-soft-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Перейти к покупкам
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-soft-white py-8 md:py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-h1 font-bold text-deep-navy mb-2">Корзина</h1>
            <p className="text-body text-deep-navy/60">
              {itemCount} {itemCount === 1 ? 'товар' : itemCount < 5 ? 'товара' : 'товаров'} на сумму {formatPrice(total)}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-card p-6 border border-lavender-bg"
                >
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    {item.thumbnail_url && (
                      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-lavender-bg flex-shrink-0">
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 96px, 128px"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-h5 font-semibold text-deep-navy mb-1">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-body-small text-deep-navy/60 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-deep-navy/40 hover:text-red-500 transition-colors flex-shrink-0"
                          aria-label="Удалить товар"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="text-h4 font-bold text-primary-purple">
                          {formatPrice(item.price)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 rounded-full bg-lavender-bg hover:bg-primary-purple/10 text-deep-navy hover:text-primary-purple transition-colors flex items-center justify-center"
                            aria-label="Уменьшить количество"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center text-body font-semibold text-deep-navy">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 rounded-full bg-lavender-bg hover:bg-primary-purple/10 text-deep-navy hover:text-primary-purple transition-colors flex items-center justify-center"
                            aria-label="Увеличить количество"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <div className="text-body-small text-deep-navy/60 mb-1">Подытог</div>
                          <div className="text-h5 font-bold text-deep-navy">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-card p-6 border border-lavender-bg sticky top-4">
                <h2 className="text-h3 font-bold text-deep-navy mb-6">Сумма заказа</h2>

                {showForm && (
                  <div className="mb-6 space-y-4">
                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    )}

                    <div className="space-y-4 p-4 bg-lavender-bg/30 rounded-xl">
                      <div>
                        <label htmlFor="email" className="block text-body-small font-semibold text-deep-navy mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 rounded-xl border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-body"
                          disabled={isProcessing || isRedirecting}
                          autoComplete="email"
                          inputMode="email"
                        />
                      </div>
                      <div>
                        <label htmlFor="name" className="block text-body-small font-semibold text-deep-navy mb-2">
                          Имя <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ваше имя"
                          className="w-full px-4 py-3 rounded-xl border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-body"
                          disabled={isProcessing || isRedirecting}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-body-small font-semibold text-deep-navy mb-2">
                          Телефон
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+7 (999) 123-45-67"
                          className="w-full px-4 py-3 rounded-xl border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-body"
                          disabled={isProcessing || isRedirecting}
                        />
                      </div>

                      {/* Offer Agreement */}
                      <div className="bg-lavender-bg rounded-xl p-4 space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreeToOffer}
                            onChange={(e) => setAgreeToOffer(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-lavender-bg text-primary-purple focus:ring-primary-purple"
                            disabled={isProcessing || isRedirecting}
                            required
                          />
                          <div className="flex-1">
                            <span className="text-body-small text-deep-navy">
                              Я согласен с{' '}
                              <Link
                                href="/legal/offer"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-purple hover:text-ocean-wave-start underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                публичной офертой
                              </Link>
                            </span>
                            <p className="text-xs text-deep-navy/60 mt-1">
                              Ссылка действительна 30 дней. Лимит скачиваний: 3 раза.
                            </p>
                          </div>
                        </label>

                        {/* Privacy Policy Agreement */}
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreeToPrivacy}
                            onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-lavender-bg text-primary-purple focus:ring-primary-purple"
                            disabled={isProcessing || isRedirecting}
                            required
                          />
                          <div className="flex-1">
                            <span className="text-body-small text-deep-navy">
                              Я согласен на{' '}
                              <Link
                                href="/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-purple hover:text-ocean-wave-start underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                обработку персональных данных
                              </Link>
                            </span>
                            <p className="text-xs text-deep-navy/60 mt-1">
                              Нажимая на кнопку, вы даете согласие на обработку персональных данных (email, имя, телефон) в соответствии с Федеральным законом № 152-ФЗ «О персональных данных» и Политикой конфиденциальности.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Info */}
                    <p className="text-xs text-deep-navy/60 text-center">
                      После оплаты вы получите ссылку для скачивания на указанный email
                    </p>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-body text-deep-navy/70">Подытог</span>
                    <span className="text-body font-semibold text-deep-navy">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <div className="border-t border-lavender-bg pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-h5 font-bold text-deep-navy">Итого</span>
                      <span className="text-h3 font-bold text-primary-purple">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🔘 [CartPage] Кнопка нажата', {
                      isProcessing,
                      isRedirecting,
                      itemsLength: items.length,
                      showForm,
                      agreeToOffer,
                      email,
                      name,
                      disabled: isProcessing || isRedirecting || items.length === 0 || (showForm && !agreeToOffer),
                    })
                    if (!isProcessing && !isRedirecting) {
                      handleCheckout()
                    }
                  }}
                  disabled={isProcessing || isRedirecting || items.length === 0 || (showForm && (!agreeToOffer || !agreeToPrivacy))}
                  className="w-full flex items-center justify-center gap-2"
                  variant="primary"
                  type="button"
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Перенаправление на оплату...
                    </>
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      {showForm ? `Оформить заказ — ${formatPrice(total)}` : 'Перейти к оформлению'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>

                <button
                  onClick={clearCart}
                  className="w-full mt-4 text-body-small text-deep-navy/60 hover:text-red-500 transition-colors"
                >
                  Очистить корзину
                </button>
              </div>
            </div>
          </div>

          {/* Upsell Section */}
          <CartUpsell cartItems={items} />
        </div>
      </div>
    </div>
  )
}
