'use client'

import { FC, useEffect, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

/**
 * Компонент для обработки deep link из бота
 * Проверяет URL параметры ?tg_id=123 и автоматически входит пользователя
 */
const DeepLinkHandlerContent: FC = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [processed, setProcessed] = useState(false)

  const handleDeepLink = useCallback(async (telegramId: string, token: string | null) => {
    try {
      const params = new URLSearchParams({ tg_id: telegramId })
      if (token) {
        params.append('token', token)
      }

      const response = await fetch(`/api/auth/telegram/link-from-bot?${params.toString()}`)
      const data = await response.json()

      if (data.success && data.authenticated) {
        // Автоматический вход выполнен
        // Удаляем параметры из URL
        router.replace(window.location.pathname)
        // Перезагружаем страницу для обновления состояния
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else if (data.success && data.needsRegistration) {
        // Пользователь найден, но нет логина/пароля
        // Можно показать уведомление или ничего не делать
        // Пользователь может свободно читать сайт
        router.replace(window.location.pathname)
      }
    } catch (error) {
      console.error('Error handling deep link:', error)
    }
  }, [router])

  useEffect(() => {
    const telegramId = searchParams.get('tg_id')
    const token = searchParams.get('token')

    // Если есть параметры из бота, обрабатываем их
    if (telegramId && !processed) {
      setProcessed(true)
      handleDeepLink(telegramId, token)
    }
  }, [searchParams, processed, handleDeepLink])

  return null // Компонент не рендерит ничего
}

export const DeepLinkHandler: FC = () => {
  return (
    <Suspense fallback={null}>
      <DeepLinkHandlerContent />
    </Suspense>
  )
}

