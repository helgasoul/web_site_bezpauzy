import type { Metadata } from 'next'
import { BackButton } from '@/components/ui/BackButton'
import { BlogListing } from '@/components/blog/BlogListing'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'

export const metadata: Metadata = {
  title: 'Журнал — Статьи о менопаузе от врачей | Без |Паузы',
  description: 'Научно обоснованные статьи о менопаузе от гинекологов, маммологов и нутрициологов. Приливы, ЗГТ, питание, сон и многое другое.',
  keywords: ['статьи менопауза', 'климакс статьи', 'женское здоровье', 'гинеколог статьи', 'менопауза блог'],
  openGraph: {
    title: 'Журнал — Статьи о менопаузе от врачей',
    description: 'Научно обоснованные статьи о менопаузе от экспертов',
    type: 'website',
  },
}

export default function BlogPage() {
  return (
    <>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8">
        <BackButton variant="ghost" />
      </div>
      <BlogListing />
      <AskEvaWidget />
    </>
  )
}

