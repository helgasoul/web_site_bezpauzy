import type { Metadata } from 'next'
import { BackButton } from '@/components/ui/BackButton'
import { BlogListing } from '@/components/blog/BlogListing'
import { NewsletterSubscription } from '@/components/blog/NewsletterSubscription'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'
import { getPublishedArticles, getArticlesByCategory } from '@/lib/blog/get-articles'

export const metadata: Metadata = {
  title: 'Журнал — Статьи о менопаузе от врачей | Без |Паузы',
  description: 'Научно обоснованные статьи о менопаузе от гинекологов, маммологов и нутрициологов. Приливы, ЗГТ, питание, сон и многое другое.',
  keywords: ['статьи менопауза', 'климакс статьи', 'женское здоровье', 'гинеколог статьи', 'менопауза блог'],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/blog`,
  },
  openGraph: {
    title: 'Журнал — Статьи о менопаузе от врачей',
    description: 'Научно обоснованные статьи о менопаузе от экспертов',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/blog`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default async function BlogPage() {
  // Загружаем все опубликованные статьи
  const allArticles = await getPublishedArticles()

  // Подсчитываем статьи по категориям
  const categoryCounts = {
    all: allArticles.length,
    gynecologist: allArticles.filter(a => a.category === 'gynecologist').length,
    mammologist: allArticles.filter(a => a.category === 'mammologist').length,
    nutritionist: allArticles.filter(a => a.category === 'nutritionist').length,
  }

  return (
    <>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8">
        <BackButton variant="ghost" />
      </div>
      <BlogListing articles={allArticles} categoryCounts={categoryCounts} />
      <NewsletterSubscription />
      <AskEvaWidget />
    </>
  )
}
