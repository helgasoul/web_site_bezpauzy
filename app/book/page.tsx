import { Metadata } from 'next'
import { BookPage } from '@/components/book/BookPage'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateBookSchema } from '@/lib/seo/schema'

export const metadata: Metadata = {
  title: 'Книга "Менопауза: Новое видение" | Без |Паузы',
  description:
    'Путешествие от страха к пониманию. Интеллектуальный гид по самой недопонятой трансформации женского тела. 12 глав, 280 страниц, 100+ научных источников.',
  keywords: [
    'книга о менопаузе',
    'менопауза книга',
    'книга для женщин 40+',
    'научная литература менопауза',
    'предзаказ книги',
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/book`,
  },
  openGraph: {
    title: 'Книга "Менопауза: Новое видение" | Без |Паузы',
    description: 'Путешествие от страха к пониманию. 12 глав, 280 страниц.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/book`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default function BookPageRoute() {
  const bookSchema = generateBookSchema({
    name: 'Менопауза: Новое видение',
    description: 'Путешествие от страха к пониманию. Интеллектуальный гид по самой недопонятой трансформации женского тела.',
    authorName: 'Ольга Пучкова',
    numberOfPages: 280,
    image: '/oblozhka.png',
    rating: {
      value: 4.8,
      count: 6,
    },
  })

  return (
    <>
      <StructuredData data={bookSchema} />
      <BookPage />
    </>
  )
}

