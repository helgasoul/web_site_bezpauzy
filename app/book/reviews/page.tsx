import { Metadata } from 'next'
import { BookReviewsPage } from '@/components/book/BookReviewsPage'
import { BackButton } from '@/components/ui/BackButton'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateBreadcrumbListSchema } from '@/lib/seo/schema'

export const metadata: Metadata = {
  title: 'Отзывы о книге "Менопауза: Новое видение" | Без |Паузы',
  description:
    'Отзывы читателей и экспертов о книге "Менопауза: Новое видение". Что говорят те, кто уже прочитал книгу.',
  keywords: [
    'отзывы книга менопауза',
    'рецензии книга',
    'мнения о книге',
    'книга менопауза отзывы',
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/book/reviews`,
  },
  openGraph: {
    title: 'Отзывы о книге "Менопауза: Новое видение"',
    description: 'Что говорят читатели и эксперты о книге',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/book/reviews`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default function BookReviewsPageRoute() {
  const breadcrumbSchema = generateBreadcrumbListSchema([
    { name: 'Главная', url: '/' },
    { name: 'Книга', url: '/book' },
    { name: 'Отзывы', url: '/book/reviews' },
  ])

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <StructuredData data={breadcrumbSchema} />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      <BookReviewsPage />
    </main>
  )
}

