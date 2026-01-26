/**
 * Утилиты для работы с блогом
 */

export type BlogCategory = 'gynecologist' | 'mammologist' | 'nutritionist'

/**
 * Маппинг категорий в отображаемые названия
 */
export function getCategoryName(category: BlogCategory): string {
  const categoryNames: Record<BlogCategory, string> = {
    gynecologist: 'Кабинет гинеколога',
    mammologist: 'Разговор с маммологом',
    nutritionist: 'Кухня нутрициолога',
  }
  return categoryNames[category] || category
}

/**
 * Получить градиент overlay для категории
 */
export function getCategoryOverlay(category: BlogCategory): string {
  const overlays: Record<BlogCategory, string> = {
    gynecologist: 'from-primary-purple/50 to-transparent',
    mammologist: 'from-warm-accent/50 to-transparent',
    nutritionist: 'from-ocean-wave-start/50 to-transparent',
  }
  return overlays[category] || 'from-primary-purple/50 to-transparent'
}

