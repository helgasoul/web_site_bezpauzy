'use client'

import { FC, useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'
import type { CartItemType } from '@/lib/types/cart'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/format'

interface AddToCartButtonProps {
  id: string
  type: CartItemType
  title: string
  description?: string
  thumbnail_url?: string
  price: number
  metadata?: Record<string, any>
  variant?: 'default' | 'compact'
  className?: string
  onClick?: () => void
}

export const AddToCartButton: FC<AddToCartButtonProps> = ({
  id,
  type,
  title,
  description,
  thumbnail_url,
  price,
  metadata,
  variant = 'default',
  className,
  onClick,
}) => {
  const { addItem, items } = useCartStore()
  const [isAdded, setIsAdded] = useState(false)

  const isInCart = items.some((item) => item.id === id && item.type === type)
  // Используем селектор для автоматического обновления при изменении корзины
  const itemCount = useCartStore((state) => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  })

  const handleAddToCart = () => {
    addItem({
      id,
      type,
      title,
      description,
      thumbnail_url,
      price,
      metadata,
    })

    setIsAdded(true)
    
    // Вызываем кастомный обработчик, если он передан
    if (onClick) {
      onClick()
    }
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isInCart || isAdded}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-body-small font-semibold transition-all ${
          isInCart || isAdded
            ? 'bg-green-100 text-green-700 cursor-default'
            : 'bg-lavender-bg text-primary-purple hover:bg-primary-purple hover:text-white'
        } ${className}`}
      >
        {isInCart || isAdded ? (
          <>
            <Check className="w-4 h-4" />
            <span>Товар добавлен в корзину ({itemCount})</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            В корзину
          </>
        )}
      </button>
    )
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isInCart || isAdded}
      variant="primary"
      className={`flex items-center gap-2 ${isInCart || isAdded ? 'opacity-75 cursor-default' : ''} ${className}`}
    >
      {isInCart || isAdded ? (
        <>
          <Check className="w-5 h-5" />
          <span>Товар добавлен в корзину ({itemCount})</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          Добавить в корзину — {formatPrice(price)}
        </>
      )}
    </Button>
  )
}
