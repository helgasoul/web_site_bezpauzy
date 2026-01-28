'use client'

import { FC, useState } from 'react'
import { Check, ShoppingCart } from 'lucide-react'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { CartConfirmationModal } from '@/components/cart/CartConfirmationModal'
import { useCartStore } from '@/lib/stores/cart-store'
import { formatPrice } from '@/lib/utils/format'
import type { Resource } from '@/lib/supabase/resources'

interface BuyResourceButtonProps {
  resource: Resource
  variant?: 'default' | 'small'
}

export const BuyResourceButton: FC<BuyResourceButtonProps> = ({
  resource,
  variant = 'default',
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  const items = useCartStore((state) => state.items)
  const getItemCount = useCartStore((state) => state.getItemCount)
  // Используем селектор для автоматического обновления при изменении корзины
  const itemCount = useCartStore((state) => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  })

  const isInCart = items.some((item) => item.id === resource.slug && item.type === 'resource')

  const price = resource.priceKopecks 
    ? resource.priceKopecks / 100
    : 399

  const handleAddToCart = () => {
    addItem({
      id: resource.slug,
      type: 'resource',
      title: resource.title,
      description: resource.description || undefined,
      thumbnail_url: resource.coverImage || undefined,
      price: price,
      metadata: {
        resource_slug: resource.slug,
      },
    })
    setIsAdded(true)
    setShowConfirmation(true)
  }

  return (
    <>
      {variant === 'small' ? (
        <button
          onClick={handleAddToCart}
          disabled={isInCart || isAdded}
          className={`w-full px-4 py-2 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            isInCart || isAdded
              ? 'bg-green-500 text-white cursor-default'
              : 'bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white'
          }`}
        >
          {isInCart || isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Товар добавлен в корзину ({itemCount})</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Добавить в корзину — {formatPrice(price)}
            </>
          )}
        </button>
      ) : (
        <div onClick={handleAddToCart}>
          <AddToCartButton
            id={resource.slug}
            type="resource"
            title={resource.title}
            description={resource.description || undefined}
            thumbnail_url={resource.coverImage || undefined}
            price={price}
            metadata={{
              resource_slug: resource.slug,
            }}
            variant="default"
          />
        </div>
      )}
      <CartConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        itemTitle={resource.title}
        itemCount={getItemCount()}
      />
    </>
  )
}
