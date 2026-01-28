'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'
import { CookieConsent } from '@/components/cookies/CookieConsent'
import { SupportButton } from '@/components/support/SupportButton'

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Проверяем, является ли текущая страница админкой
  const isAdminPage = pathname?.startsWith('/admin')

  // Для админских страниц показываем только children без Header/Footer
  if (isAdminPage) {
    return <>{children}</>
  }

  // Для обычных страниц показываем полный layout
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
        {children}
      </main>
      <Footer />
      <CookieConsent />
      <SupportButton />
    </>
  )
}
