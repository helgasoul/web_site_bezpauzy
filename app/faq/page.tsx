import { Metadata } from 'next'
import { FAQPage } from '@/components/faq/FAQPage'
import { StructuredData } from '@/components/seo/StructuredData'
import { generateFAQPageSchema } from '@/lib/seo/schema'
import { faqData } from '@/lib/data/faq'

export const metadata: Metadata = {
  title: 'Часто задаваемые вопросы (FAQ) | Без |Паузы',
  description:
    'Ответы на популярные вопросы о менопаузе, проекте Без|паузы, ассистенте Еве, статьях и подписках. Не нашли ответ? Спросите Еву.',
  keywords: [
    'FAQ менопауза',
    'вопросы о менопаузе',
    'помощь при менопаузе',
    'консультации по менопаузе',
  ],
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/faq`,
  },
  openGraph: {
    title: 'Часто задаваемые вопросы (FAQ) | Без |Паузы',
    description: 'Ответы на популярные вопросы о менопаузе и проекте',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/faq`,
  },
  other: {
    'telegram:channel': '@bezpauzi',
  },
}

export default function FAQPageRoute() {
  const faqSchema = generateFAQPageSchema(
    faqData.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    }))
  )

  return (
    <>
      <StructuredData data={faqSchema} />
      <FAQPage />
    </>
  )
}

