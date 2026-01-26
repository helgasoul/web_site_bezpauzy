import { Metadata } from 'next'
import { FC } from 'react'
import Link from 'next/link'
import { CheckCircle2, Download, ArrowRight } from 'lucide-react'
import { PurchaseSuccessClient } from '@/components/resources/PurchaseSuccessClient'

export const metadata: Metadata = {
  title: 'Оплата успешна | Без |Паузы',
  description: 'Спасибо за покупку! Ваш гайд готов к скачиванию.',
  robots: 'noindex, nofollow', // Не индексируем страницу успеха
}

interface PurchaseSuccessPageProps {
  searchParams: Promise<{ orderId?: string; test?: string }>
}

export default async function PurchaseSuccessPage(props: PurchaseSuccessPageProps) {
  const searchParams = await props.searchParams
  const { orderId, test } = searchParams

  return <PurchaseSuccessClient orderId={orderId || undefined} isTest={test === 'true'} />
}

