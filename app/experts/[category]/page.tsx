import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ExpertPage } from '@/components/experts/ExpertPage'
import { getExpertPageData, getAllExperts } from '@/lib/experts/get-expert-data'

type Category = 'gynecologist' | 'mammologist' | 'nutritionist'

interface PageProps {
  params: Promise<{
    category: string
  }>
}

// Revalidate страницы каждые 60 секунд (для обновления данных из базы)
export const revalidate = 60

// Генерируем статические пути для всех категорий
export async function generateStaticParams() {
  const experts = await getAllExperts()
  return experts.map((expert) => ({
    category: expert.category,
  }))
}

// Генерируем метаданные для каждой страницы
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const categoryMap: Record<string, string> = {
    gynecologist: 'Кабинет гинеколога',
    mammologist: 'Кабинет маммолога',
    nutritionist: 'Кухня нутрициолога',
  }

  const expertData = await getExpertPageData(category as Category)
  
  if (!expertData) {
    return {
      title: 'Эксперт не найден | Без |Паузы',
    }
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
  const { category } = await params

  // Валидация категории
  if (!['gynecologist', 'mammologist', 'nutritionist'].includes(category)) {
    notFound()
  }

  const expertData = await getExpertPageData(category as Category)

  if (!expertData) {
    notFound()
  }

  return <ExpertPage expertData={expertData} />
}

