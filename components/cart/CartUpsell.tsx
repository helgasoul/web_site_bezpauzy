'use client'

import { FC, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Book, FileText } from 'lucide-react'
import { AddToCartButton } from './AddToCartButton'
import { CartConfirmationModal } from './CartConfirmationModal'
import { useCartStore } from '@/lib/stores/cart-store'
import type { CartItem } from '@/lib/types/cart'
import { formatPrice } from '@/lib/utils/format'
import Image from 'next/image'
import Link from 'next/link'

interface CartUpsellProps {
  cartItems: CartItem[]
}

interface RecommendedResource {
  id: string
  slug: string
  title: string
  description: string
  thumbnailUrl?: string
  priceKopecks: number
}

export const CartUpsell: FC<CartUpsellProps> = ({ cartItems }) => {
  const [recommendedItems, setRecommendedItems] = useState<RecommendedResource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{ title: string } | null>(null)
  const addItem = useCartStore((state) => state.addItem)
  const getItemCount = useCartStore((state) => state.getItemCount)

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true)
      try {
        // Определяем тип товаров в корзине
        const hasBook = cartItems.some(item => item.type === 'book')
        const hasResources = cartItems.some(item => item.type === 'resource')

        // Если в корзине книга - рекомендуем гайды
        // Если гайды - рекомендуем книгу и другие гайды
        const recommendations: RecommendedResource[] = []

        if (hasBook) {
          // Рекомендуем популярные гайды
          const response = await fetch('/api/resources/recommended?limit=3')
          if (response.ok) {
            const data = await response.json()
            recommendations.push(...(data.resources || []))
          }
        } else if (hasResources) {
          // Рекомендуем книгу и другие гайды
          const [bookResponse, resourcesResponse] = await Promise.all([
            fetch('/api/resources/recommended?type=book&limit=1'),
            fetch('/api/resources/recommended?limit=2'),
          ])

          if (bookResponse.ok) {
            const bookData = await bookResponse.json()
            if (bookData.book) {
              recommendations.push(bookData.book)
            }
          }

          if (resourcesResponse.ok) {
            const resourcesData = await resourcesResponse.json()
            if (resourcesData.resources) {
              // Фильтруем уже добавленные в корзину ресурсы
              const cartResourceSlugs = cartItems
                .filter(item => item.type === 'resource')
                .map(item => item.id)
              
              const filteredResources = (resourcesData.resources || []).filter(
                (r: RecommendedResource) => !cartResourceSlugs.includes(r.slug)
              )
              recommendations.push(...filteredResources)
            }
          }
        }

        setRecommendedItems(recommendations)
      } catch (error) {
        console.error('Ошибка загрузки рекомендаций:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (cartItems.length > 0) {
      fetchRecommendations()
    } else {
      setIsLoading(false)
    }
  }, [cartItems])

  const handleAddToCart = (item: RecommendedResource) => {
    addItem({
      id: item.slug,
      type: item.slug === 'book' ? 'book' : 'resource',
      title: item.title,
      description: item.description,
      thumbnail_url: item.thumbnailUrl,
      price: item.priceKopecks / 100,
      metadata: {
        resource_slug: item.slug,
        book_type: item.slug === 'book' ? 'digital' : undefined,
      },
    })
    setSelectedItem({ title: item.title })
    setShowConfirmation(true)
  }

  // Не показываем секцию, если еще загружается или нет рекомендаций
  if (isLoading) {
    return null
  }

  if (recommendedItems.length === 0) {
    return null
  }

  return (
    <>
      <div className="mt-12 pt-12 border-t-2 border-lavender-bg">
        <div className="mb-8">
          <h2 className="text-h2 font-bold text-deep-navy mb-2">
            С этим товаром покупают
          </h2>
          <p className="text-body text-deep-navy/60">
            Рекомендуем обратить внимание на эти товары
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-card p-6 border border-lavender-bg hover:shadow-card-hover transition-all"
            >
              {/* Thumbnail */}
              {item.thumbnailUrl && (
                <Link href={item.slug === 'book' ? '/book' : '/resources/guides'}>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-lavender-bg mb-4">
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>
              )}

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <Link href={item.slug === 'book' ? '/book' : '/resources/guides'}>
                    <h3 className="text-h5 font-semibold text-deep-navy mb-2 hover:text-primary-purple transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-body-small text-deep-navy/60 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </Link>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-2 border-t border-lavender-bg">
                  <div className="text-h4 font-bold text-primary-purple">
                    {formatPrice(item.priceKopecks / 100)}
                  </div>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="px-4 py-2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white rounded-full text-body-small font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    В корзину
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <CartConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false)
          setSelectedItem(null)
        }}
        itemTitle={selectedItem?.title || ''}
        itemCount={getItemCount()}
      />
    </>
  )
}
