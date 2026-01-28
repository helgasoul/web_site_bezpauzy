/**
 * Утилиты форматирования для админ-панели
 */

/**
 * Форматирование суммы в копейках в рубли
 */
export function formatAmount(kopecks: number): string {
  return `${(kopecks / 100).toLocaleString('ru-RU')}₽`
}

/**
 * Форматирование даты в формат дд.мм.гггг чч:мм
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return '—'

  try {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}.${month}.${year} ${hours}:${minutes}`
  } catch {
    return '—'
  }
}

/**
 * Форматирование статуса заказа на русский язык
 */
export function formatOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Ожидает оплаты',
    paid: 'Оплачен',
    shipped: 'Отправлен',
    cancelled: 'Отменен',
    refunded: 'Возврат',
  }
  return statusMap[status] || status
}

/**
 * Форматирование типа книги на русский язык
 */
export function formatBookType(bookType: string): string {
  const typeMap: Record<string, string> = {
    digital: 'Цифровая',
    physical: 'Печатная',
  }
  return typeMap[bookType] || bookType
}

/**
 * Получение цвета для статуса заказа (для badge)
 */
export function getOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'bg-orange-100 text-orange-800',
    paid: 'bg-green-100 text-green-800',
    shipped: 'bg-cyan-100 text-cyan-800',
    cancelled: 'bg-gray-100 text-gray-800',
    refunded: 'bg-red-100 text-red-800',
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}
