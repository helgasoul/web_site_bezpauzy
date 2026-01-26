import type { Metadata } from 'next'
import { UnsubscribePage } from '@/components/newsletter/UnsubscribePage'

export const metadata: Metadata = {
  title: 'Отписка от рассылки | Без |Паузы',
  description: 'Отписка от email рассылки Без |Паузы',
  robots: 'noindex, nofollow', // Не индексировать страницу отписки
}

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string; email?: string }>
}

export default async function UnsubscribePageRoute({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams
  const { token, email } = params

  return <UnsubscribePage token={token} email={email} />
}

