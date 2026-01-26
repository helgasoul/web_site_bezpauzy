import type { Metadata } from 'next'
import { BackButton } from '@/components/ui/BackButton'
import { KnowledgeBaseHero } from '@/components/knowledge-base/KnowledgeBaseHero'
import { KnowledgeBaseSearchAndFilters } from '@/components/knowledge-base/KnowledgeBaseSearchAndFilters'
import { KnowledgeBaseCategories } from '@/components/knowledge-base/KnowledgeBaseCategories'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'

export const metadata: Metadata = {
  title: 'База знаний о менопаузе | Без |Паузы',
  description: 'Вся информация о менопаузе в одном месте: статьи, гайды, чек-листы и интерактивные материалы от экспертов. Симптомы, стадии, лечение и развенчание мифов.',
  keywords: ['база знаний менопауза', 'информация о климаксе', 'симптомы менопаузы', 'лечение менопаузы', 'стадии менопаузы'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/knowledge-base`,
  },
  openGraph: {
    title: 'База знаний о менопаузе | Без |Паузы',
    description: 'Вся информация о менопаузе в одном месте: статьи, гайды, чек-листы и интерактивные материалы',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/knowledge-base`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default function KnowledgeBasePage() {
  return (
    <>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8">
        <BackButton variant="ghost" />
      </div>
      <KnowledgeBaseHero />
      <KnowledgeBaseSearchAndFilters />
      <KnowledgeBaseCategories />
      <AskEvaWidget />
    </>
  )
}

