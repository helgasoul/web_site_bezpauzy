import { Metadata } from 'next'
import { BookPurchaseSuccessClient } from '@/components/book/BookPurchaseSuccessClient'

export const metadata: Metadata = {
  title: 'Заказ принят | Без |Паузы',
  description: 'Ваш заказ на книгу принят. Спасибо за покупку!',
  robots: {
    index: false,
    follow: false,
  },
}

interface BookPurchaseSuccessPageProps {
  searchParams: Promise<{ orderId?: string; test?: string }>
}

export default async function BookPurchaseSuccessPage({
  searchParams,
}: BookPurchaseSuccessPageProps) {
  const params = await searchParams
  const orderId = params.orderId
  const isTest = params.test === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple via-ocean-wave-start to-ocean-wave-end">
      <BookPurchaseSuccessClient orderId={orderId || null} isTest={isTest} />
    </div>
  )
}

