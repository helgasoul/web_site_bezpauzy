/**
 * Zustand store for shopping cart
 * Synced with server for authenticated users, localStorage for anonymous users
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartState } from '@/lib/types/cart'

// Функция для синхронизации корзины с сервером (debounced)
let syncTimeout: NodeJS.Timeout | null = null

async function syncCartToServer(items: CartItem[]) {
  // Очищаем предыдущий таймаут
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  // Отправляем на сервер с задержкой 500ms (debounce)
  syncTimeout = setTimeout(async () => {
    try {
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ items }),
      })
    } catch (error) {
      // Игнорируем ошибки синхронизации (может быть пользователь не авторизован)
      console.warn('⚠️ [CartStore] Не удалось синхронизировать корзину с сервером:', error)
    }
  }, 500)
}

// Функция для загрузки корзины с сервера
async function loadCartFromServer(): Promise<CartItem[]> {
  try {
    const response = await fetch('/api/cart/sync', {
      method: 'GET',
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
      return data.items || []
    }
  } catch (error) {
    // Игнорируем ошибки загрузки (может быть пользователь не авторизован)
    console.warn('⚠️ [CartStore] Не удалось загрузить корзину с сервера:', error)
  }
  
  return []
}

interface CartStoreState extends CartState {
  isInitialized: boolean
  initializeCart: () => Promise<void>
  _internalSync: () => void
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isInitialized: false,

      // Инициализация корзины (загрузка с сервера для авторизованных пользователей)
      initializeCart: async () => {
        if (get().isInitialized) {
          return
        }

        // Загружаем корзину с сервера
        const serverItems = await loadCartFromServer()
        
        if (serverItems.length > 0) {
          // Если есть данные на сервере, используем их
          set({ items: serverItems, isInitialized: true })
        } else {
          // Иначе используем данные из localStorage (которые уже загружены через persist)
          set({ isInitialized: true })
          
          // Синхронизируем текущую корзину на сервер (если пользователь авторизован)
          const currentItems = get().items
          if (currentItems.length > 0) {
            await syncCartToServer(currentItems)
          }
        }
      },

      // Внутренняя функция синхронизации
      _internalSync: () => {
        const items = get().items
        syncCartToServer(items)
      },

      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.id === item.id && i.type === item.type)

        let newItems: CartItem[]
        if (existingItem) {
          // Если товар уже в корзине, увеличиваем количество
          newItems = items.map((i) =>
            i.id === item.id && i.type === item.type
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        } else {
          // Добавляем новый товар
          newItems = [...items, { ...item, quantity: 1 }]
        }

        set({ items: newItems })
        get()._internalSync()
      },

      removeItem: (id) => {
        const newItems = get().items.filter((item) => item.id !== id)
        set({ items: newItems })
        get()._internalSync()
      },

      updateQuantity: (id, quantity) => {
        let newItems: CartItem[]
        if (quantity <= 0) {
          newItems = get().items.filter((item) => item.id !== id)
        } else {
          newItems = get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          )
        }
        
        set({ items: newItems })
        get()._internalSync()
      },

      clearCart: () => {
        set({ items: [] })
        get()._internalSync()
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'bezpauzy-cart-storage',
      // Сохраняем корзину в localStorage как fallback
      partialize: (state) => ({
        items: state.items,
        isInitialized: false, // Не сохраняем isInitialized в localStorage
      }),
    }
  )
)
