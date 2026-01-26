import { Metadata } from 'next'
import { GuidesPageServer } from '@/components/resources/GuidesPageServer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Гайды | Без |Паузы',
  description: 'Скачайте гайды по здоровью в период менопаузы: противовоспалительное питание, управление симптомами и многое другое.',
  keywords: ['гайды менопауза', 'гайды', 'здоровье женщины', 'менопауза гайды'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/resources/guides`,
  },
  openGraph: {
    title: 'Гайды | Без |Паузы',
    description: 'Скачайте гайды по здоровью в период менопаузы: противовоспалительное питание, управление симптомами и многое другое.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/resources/guides`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default function GuidesPageRoute() {
  return <GuidesPageServer />
}

