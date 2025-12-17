import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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
      <Header />
      <main className="min-h-screen">
        <BlogListing />
        <AskEvaWidget />
      </main>
      <Footer />
    </>
  )
}

