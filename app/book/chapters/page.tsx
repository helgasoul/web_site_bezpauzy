import { Metadata } from 'next'
import { BookChaptersPage } from '@/components/book/BookChaptersPage'
import { BackButton } from '@/components/ui/BackButton'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateBreadcrumbListSchema } from '@/lib/seo/schema'

export const metadata: Metadata = {
  title: 'Оглавление книги "Менопауза: Новое видение" | Без |Паузы',
  description:
    'Детальное оглавление книги: 12 глав в 5 частях. От страха к пониманию, от незнания к знанию, от страдания к трансформации.',
  keywords: [
    'оглавление книги менопауза',
    'содержание книги',
    'главы книги менопауза',
    'структура книги',
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/book/chapters`,
  },
  openGraph: {
    title: 'Оглавление книги "Менопауза: Новое видение"',
    description: '12 глав в 5 частях — путешествие от страха к пониманию',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/book/chapters`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default function BookChaptersPageRoute() {
  const breadcrumbSchema = generateBreadcrumbListSchema([
    { name: 'Главная', url: '/' },
    { name: 'Книга', url: '/book' },
    { name: 'Оглавление', url: '/book/chapters' },
  ])

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <StructuredData data={breadcrumbSchema} />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      <BookChaptersPage />
    </main>
  )
}

