'use client'

import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { CartConfirmationModal } from '@/components/cart/CartConfirmationModal'
import { useCartStore } from '@/lib/stores/cart-store'

interface BookPreOrderFormProps {}

export const BookPreOrderForm: FC<BookPreOrderFormProps> = () => {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const getItemCount = useCartStore((state) => state.getItemCount)

  const handleAddToCart = () => {
    addItem({
      id: 'book-menopauza-novoe-videnie',
      type: 'book',
      title: 'Менопауза: Новое видение',
      description: 'Электронная версия (EPUB). Доступна сразу после оплаты.',
      thumbnail_url: '/oblozhka.png',
      price: 1200,
      metadata: {
        book_type: 'digital',
      },
    })
    setShowConfirmation(true)
  }

  return (
    <section id="pre-order-form" className="py-16 md:py-24 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-h2 md:text-h1 font-bold text-deep-navy mb-4">
              Предзаказ книги
            </h2>
            <p className="text-body-large text-deep-navy/70 max-w-2xl mx-auto">
              Заполните форму и оплатите заказ. Электронная версия доступна сразу после оплаты.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-3xl p-8 md:p-12 shadow-card border border-lavender-bg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Book Type Info */}
            <div className="mb-8">
              <div className="flex items-center gap-4 p-6 rounded-2xl border-2 border-lavender-bg bg-lavender-bg/50">
                <Download className="w-6 h-6 text-primary-purple flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-h5 font-semibold text-deep-navy mb-1">
                    Электронная версия (EPUB)
                  </div>
                  <div className="text-body-small text-deep-navy/70">
                    Доступна сразу после оплаты. Ссылка для скачивания будет отправлена на email.
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-lavender-bg rounded-2xl p-6 space-y-3 mb-8">
              <div className="flex justify-between items-center text-body text-deep-navy">
                <span>Стоимость книги:</span>
                <span className="font-semibold">1,200₽</span>
              </div>
              <div className="flex justify-between items-center text-body text-deep-navy">
                <span>Бонус:</span>
                <span className="text-primary-purple font-semibold">1 месяц Paid1 (599₽) в подарок</span>
              </div>
              <div className="pt-3 border-t border-primary-purple/20 flex justify-between items-center">
                <span className="text-h5 font-semibold text-deep-navy">Итого:</span>
                <span className="text-h4 font-bold text-primary-purple">1,200₽</span>
              </div>
            </div>

            {/* Submit Button */}
            <div onClick={handleAddToCart}>
              <AddToCartButton
                id="book-menopauza-novoe-videnie"
                type="book"
                title="Менопауза: Новое видение"
                description="Электронная версия (EPUB). Доступна сразу после оплаты."
                thumbnail_url="/oblozhka.png"
                price={1200}
                metadata={{
                  book_type: 'digital',
                }}
                variant="default"
                className="w-full"
              />
            </div>

            <p className="text-body-small text-deep-navy/60 text-center mt-4">
              Товар будет добавлен в корзину. После оформления заказа вы будете перенаправлены на страницу оплаты ЮКасса
            </p>
          </motion.div>
        </div>
      </div>

      {/* Cart Confirmation Modal */}
      <CartConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        itemTitle="Менопауза: Новое видение"
        itemCount={getItemCount()}
      />
    </section>
  )
}
