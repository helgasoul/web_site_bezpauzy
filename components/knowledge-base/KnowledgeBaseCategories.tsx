'use client'

import { FC } from 'react'
import { CategoryCard } from './CategoryCard'
import { knowledgeBaseConfig } from '@/lib/knowledge-base/config'

interface KnowledgeBaseCategoriesProps {}

export const KnowledgeBaseCategories: FC<KnowledgeBaseCategoriesProps> = () => {
  return (
    <section className="py-16 md:py-24 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-h2 font-bold text-deep-navy mb-4">
            Изучайте по категориям
          </h2>
          <p className="text-body text-deep-navy/70 max-w-2xl mx-auto">
            Выберите интересующую вас категорию и найдите все материалы по теме в одном месте
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {knowledgeBaseConfig.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

