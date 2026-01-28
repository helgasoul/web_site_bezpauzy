'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<{ id: string; email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const hasCheckedAuth = useRef(false)

  // Ждем монтирования компонента
  useEffect(() => {
    setMounted(true)
  }, [])

  // Проверяем авторизацию только один раз
  useEffect(() => {
    console.log('🔍 [AdminLayout] useEffect triggered', { mounted, hasCheckedAuth: hasCheckedAuth.current, pathname })

    if (!mounted || hasCheckedAuth.current) {
      console.log('🔍 [AdminLayout] Skipping auth check', { mounted, hasCheckedAuth: hasCheckedAuth.current })
      return
    }

    const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login-simple'

    if (isLoginPage) {
      console.log('🔍 [AdminLayout] Login page detected, skipping auth')
      setLoading(false)
      hasCheckedAuth.current = true
      return
    }

    console.log('🔍 [AdminLayout] Starting auth check...')

    // Создаем AbortController для таймаута
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log('⏰ [AdminLayout] Auth check timeout')
      abortController.abort()
    }, 5000)

    // Проверяем авторизацию
    fetch('/api/admin/auth/me', {
      signal: abortController.signal,
    })
      .then((res) => {
        console.log('✅ [AdminLayout] Auth response received', { ok: res.ok, status: res.status })
        clearTimeout(timeoutId)
        if (!res.ok) {
          throw new Error('Unauthorized')
        }
        return res.json()
      })
      .then((data) => {
        console.log('✅ [AdminLayout] Auth data parsed', { hasAdmin: !!data.admin })
        if (data.admin) {
          setAdmin(data.admin)
        } else {
          console.log('🔒 [AdminLayout] No admin in response, redirecting to login')
          router.push('/admin/login')
        }
        setLoading(false)
        hasCheckedAuth.current = true
      })
      .catch((error) => {
        console.error('❌ [AdminLayout] Auth check failed', error)
        clearTimeout(timeoutId)
        if (error.name !== 'AbortError') {
          console.error('Admin auth error:', error)
        }
        if (!hasCheckedAuth.current) {
          console.log('🔒 [AdminLayout] Auth failed, redirecting to login')
          router.push('/admin/login')
          setLoading(false)
          hasCheckedAuth.current = true
        }
      })

    return () => {
      clearTimeout(timeoutId)
      abortController.abort()
    }
  }, [mounted, pathname, router])

  // На странице логина показываем только children
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login-simple'
  if (isLoginPage) {
    return <>{children}</>
  }

  // Пока не смонтирован или загружается, показываем загрузку
  if (!mounted || loading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!mounted ? 'Инициализация...' : 'Проверка авторизации...'}
          </p>
        </div>
      </div>
    )
  }

  // Основной layout с Sidebar и Header
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar admin={admin} />
      <div className="ml-64">
        <AdminHeader admin={admin} />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
