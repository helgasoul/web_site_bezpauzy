import { Metadata } from 'next'
import { NewsletterPage } from '@/components/newsletter/NewsletterPage'

export const metadata: Metadata = {
  title: 'Подписка на рассылку | Без |Паузы',
  description:
    'Получайте научные новости о менопаузе, практические советы от врачей и актуальные статьи прямо на почту.',
  keywords: ['рассылка', 'менопауза', 'научные новости', 'подписка'],
  openGraph: {
    title: 'Подписка на рассылку | Без |Паузы',
    description: 'Получайте научные новости о менопаузе прямо на почту',
    type: 'website',
  },
}

export default function NewsletterPageRoute() {
  return <NewsletterPage />
}

