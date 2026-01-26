import type { Metadata } from 'next'
import { BackButton } from '@/components/ui/BackButton'
import dynamicImport from 'next/dynamic'

// Force revalidation to prevent caching issues in Cursor browser
export const revalidate = 0
export const dynamic = 'force-dynamic'

// Dynamic imports для оптимизации bundle size
// CommunityDashboard - большой компонент с множеством зависимостей
const CommunityDashboard = dynamicImport(
  () => import('@/components/community/CommunityDashboard').then(mod => ({ default: mod.CommunityDashboard })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-purple mx-auto mb-4"></div>
          <p className="text-deep-navy/70">Загрузка личного кабинета...</p>
        </div>
      </div>
    ),
    ssr: false, // Компонент использует client-side state, SSR не нужен
  }
)

const AskEvaWidget = dynamicImport(
  () => import('@/components/ui/AskEvaWidget').then(mod => ({ default: mod.AskEvaWidget })),
  {
    ssr: false,
    loading: () => null,
  }
)

export const metadata: Metadata = {
  title: 'Личный кабинет сообщества — Сообщество «Без паузы» | Без |Паузы',
  description: 'Доступ к форуму, видео, статьям и календарю вебинаров сообщества «Без паузы»',
  keywords: ['сообщество', 'личный кабинет', 'форум', 'вебинары', 'видео', 'менопауза'],
  openGraph: {
    title: 'Личный кабинет сообщества «Без паузы»',
    description: 'Доступ ко всем ресурсам сообщества',
    type: 'website',
  },
}

export default function CommunityDashboardPage() {
  return (
    <>
      <CommunityDashboard />
      <AskEvaWidget />
    </>
  )
}

