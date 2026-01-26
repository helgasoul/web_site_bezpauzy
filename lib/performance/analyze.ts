/**
 * Утилиты для анализа производительности
 */

export interface PerformanceMetrics {
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
}

/**
 * Логирование метрик производительности (для клиентской стороны)
 */
export function logWebVitals(metric: any) {
  const { name, value, id } = metric

  // Отправка метрик в аналитику (можно добавить позже)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, {
      event_category: 'Web Vitals',
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_label: id,
      non_interaction: true,
    })
  }

  // Логирование в консоль (только в development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${name}:`, value)
  }
}

/**
 * Проверка, является ли соединение медленным
 */
export function isSlowConnection(): boolean {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return false
  }

  const connection = (navigator as any).connection
  if (!connection) return false

  // Проверка эффективного типа соединения
  const effectiveType = connection.effectiveType
  return effectiveType === 'slow-2g' || effectiveType === '2g'
}

/**
 * Получение рекомендаций по оптимизации на основе метрик
 */
export function getPerformanceRecommendations(metrics: PerformanceMetrics): string[] {
  const recommendations: string[] = []

  // LCP (Largest Contentful Paint) - должен быть < 2.5s
  if (metrics.lcp && metrics.lcp > 2500) {
    recommendations.push(
      `LCP слишком медленный (${Math.round(metrics.lcp)}ms). Оптимизируйте загрузку изображений и критический CSS.`
    )
  }

  // FID (First Input Delay) - должен быть < 100ms
  if (metrics.fid && metrics.fid > 100) {
    recommendations.push(
      `FID слишком медленный (${Math.round(metrics.fid)}ms). Уменьшите JavaScript bundle size и используйте code splitting.`
    )
  }

  // CLS (Cumulative Layout Shift) - должен быть < 0.1
  if (metrics.cls && metrics.cls > 0.1) {
    recommendations.push(
      `CLS слишком высокий (${metrics.cls.toFixed(3)}). Добавьте размеры для изображений и избегайте динамического контента выше fold.`
    )
  }

  // FCP (First Contentful Paint) - должен быть < 1.8s
  if (metrics.fcp && metrics.fcp > 1800) {
    recommendations.push(
      `FCP слишком медленный (${Math.round(metrics.fcp)}ms). Оптимизируйте критический рендеринг и минимизируйте блокирующие ресурсы.`
    )
  }

  // TTFB (Time to First Byte) - должен быть < 600ms
  if (metrics.ttfb && metrics.ttfb > 600) {
    recommendations.push(
      `TTFB слишком медленный (${Math.round(metrics.ttfb)}ms). Оптимизируйте серверный рендеринг и используйте CDN.`
    )
  }

  return recommendations
}

