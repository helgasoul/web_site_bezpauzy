'use client'

import { useEffect } from 'react'
import { logWebVitals } from '@/lib/performance/analyze'

/**
 * Компонент для отслеживания Core Web Vitals
 * Использует Next.js встроенную поддержку Web Vitals
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // В Next.js 14+ Web Vitals отслеживаются автоматически
    // Этот компонент можно использовать для кастомной логики
    // или отправки метрик в аналитику
    
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[Performance] Web Vitals monitoring enabled')
    }
  }, [])

  return null
}

