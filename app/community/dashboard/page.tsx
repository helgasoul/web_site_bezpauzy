import type { Metadata } from 'next'
import { BackButton } from '@/components/ui/BackButton'
import { CommunityDashboard } from '@/components/community/CommunityDashboard'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'

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

