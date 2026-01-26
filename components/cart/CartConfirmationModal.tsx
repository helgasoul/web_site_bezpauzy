'use client'

import { FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface CartConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  itemTitle: string
  itemCount: number
}

export const CartConfirmationModal: FC<CartConfirmationModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  itemCount,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-primary-purple to-ocean-wave-start rounded-t-3xl px-6 py-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-h4 font-bold text-white">
                      Товар добавлен в корзину!
                    </h2>
                    <p className="text-body-small text-white/90">
                      {itemTitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div className="bg-lavender-bg rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-body text-deep-navy/70">
                      Товаров в корзине:
                    </span>
                    <span className="text-h4 font-bold text-primary-purple">
                      {itemCount}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Link href="/cart" onClick={onClose}>
                    <Button
                      variant="primary"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Перейти в корзину
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="w-full"
                  >
                    Продолжить покупки
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
