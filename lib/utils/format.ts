/**
 * Formatting utilities
 */

/**
 * Formats price in rubles
 * @param price - Price in rubles (number)
 * @returns Formatted price string (e.g., "1 200 ₽")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Formats price in kopecks to rubles
 * @param kopecks - Price in kopecks (number)
 * @returns Formatted price string (e.g., "1 200 ₽")
 */
export function formatPriceFromKopecks(kopecks: number): string {
  return formatPrice(kopecks / 100)
}
