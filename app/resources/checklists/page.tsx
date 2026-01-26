import { Metadata } from 'next'
import { ChecklistsPageServer } from '@/components/resources/ChecklistsPageServer'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Бесплатные чек-листы | Без |Паузы',
  description: 'Скачайте бесплатные чек-листы для подготовки к визиту к врачу, отслеживания симптомов и управления здоровьем в период менопаузы.',
  keywords: ['чек-листы менопауза', 'бесплатные чек-листы', 'подготовка к врачу', 'менопауза чек-листы'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/resources/checklists`,
  },
  openGraph: {
    title: 'Бесплатные чек-листы | Без |Паузы',
    description: 'Скачайте бесплатные чек-листы для подготовки к визиту к врачу, отслеживания симптомов и управления здоровьем в период менопаузы.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/resources/checklists`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default function ChecklistsPageRoute() {
  return <ChecklistsPageServer />
}
