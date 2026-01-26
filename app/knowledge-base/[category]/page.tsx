import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/ui/BackButton'
import { AskEvaWidget } from '@/components/ui/AskEvaWidget'
import { getCategoryBySlug, knowledgeBaseConfig } from '@/lib/knowledge-base/config'
import { KnowledgeBaseTopicList } from '@/components/knowledge-base/KnowledgeBaseTopicList'

interface CategoryPageProps {
  params: {
    category: string
  }
}

export async function generateStaticParams() {
  return knowledgeBaseConfig.map((category) => ({
    category: category.slug,
  }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.category)
  
  if (!category) {
    return {
      title: 'Категория не найдена | Без |Паузы',
    }
  }

  return {
    title: `${category.title} | База знаний | Без |Паузы`,
    description: category.description,
    openGraph: {
      title: `${category.title} | База знаний`,
      description: category.description,
      type: 'website',
    },
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.category)

  if (!category) {
    notFound()
  }

  return (
    <>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8">
        <BackButton variant="ghost" />
      </div>
      <KnowledgeBaseTopicList category={category} />
      <AskEvaWidget />
    </>
  )
}

