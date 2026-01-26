/**
 * Types for shopping cart
 */

export type CartItemType = 'book' | 'resource'

export interface CartItem {
  id: string // Уникальный ID товара (book ID или resource slug)
  type: CartItemType
  title: string
  description?: string
  thumbnail_url?: string
  price: number // Цена в рублях
  quantity: number
  // Дополнительные данные в зависимости от типа
  metadata?: {
    book_type?: 'digital' | 'physical'
    resource_slug?: string
    [key: string]: any
  }
}

export interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}
