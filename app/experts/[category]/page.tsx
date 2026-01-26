import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ExpertPage } from '@/components/experts/ExpertPage'
import { getExpertPageData } from '@/lib/experts/get-expert-data'

type Category = 'gynecologist' | 'mammologist' | 'nutritionist'

const VALID_CATEGORIES: readonly Category[] = ['gynecologist', 'mammologist', 'nutritionist']

interface PageProps {
  params: Promise<{
    category: string
  }>
}

// Страница рендерится по запросу, чтобы не требовать SUPABASE_SERVICE_ROLE_KEY на этапе сборки
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Явно задаём допустимые категории — на части хостингов это предотвращает 404 по /experts/:category
export function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }))
}

// Генерируем метаданные для каждой страницы
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params
  const category = typeof resolved?.category === 'string' ? resolved.category.trim().toLowerCase() : ''
  const categoryMap: Record<string, string> = {
    gynecologist: 'Кабинет гинеколога',
    mammologist: 'Кабинет маммолога',
    nutritionist: 'Кухня нутрициолога',
  }

  if (!VALID_CATEGORIES.includes(category as Category)) {
    return { title: 'Эксперт не найден | Без |Паузы' }
  }

  const expertData = await getExpertPageData(category as Category)
  if (!expertData) {
    return { title: 'Эксперт не найден | Без |Паузы' }
  }

  const expertName = expertData.expert.name
  const categoryName = categoryMap[category] || category

  return {
    title: `${categoryName} — ${expertName} | Без |Паузы`,
    description: `${expertData.expert.description} Статьи, видео и запись на консультацию с ${expertName.toLowerCase()}.`,
    keywords: [
      categoryName.toLowerCase(),
      expertName.toLowerCase(),
      expertData.expert.specialization.toLowerCase(),
      'консультация',
      'менопауза',
    ],
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/experts/${category}`,
    },
    openGraph: {
      title: `${categoryName} — ${expertName}`,
      description: expertData.expert.description,
      type: 'profile',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'}/experts/${category}`,
      images: expertData.expert.image
        ? [
            {
              url: expertData.expert.image,
              width: 1200,
              height: 630,
              alt: expertName,
            },
          ]
        : undefined,
    },
  }
}

export default async function ExpertCategoryPage({ params }: PageProps) {
  const resolved = await params
  const category = typeof resolved?.category === 'string' ? resolved.category.trim().toLowerCase() : ''

  if (!VALID_CATEGORIES.includes(category as Category)) {
    notFound()
  }

  const expertData = await getExpertPageData(category as Category)
  if (!expertData) {
    notFound()
  }

  return <ExpertPage expertData={expertData} />
}

