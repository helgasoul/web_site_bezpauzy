'use client'

import { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface Article {
  id: number
  title: string
  excerpt: string
  slug: string
  categoryName: string
  publishedAt: string
  readTime: number
  image: string
  gradient: string
}

interface TopicArticlesProps {
  articleSlugs?: string[]
  topicTags?: string[]
}

// Mock данные статей (в будущем будет загрузка из Supabase)
const allArticles: Record<string, Article> = {
  'prilivy-prichiny-i-resheniya': {
    id: 1,
    title: 'Приливы: причины и 10 способов облегчения',
    excerpt: 'Узнайте, почему возникают приливы и как можно облегчить этот симптом менопаузы.',
    slug: 'prilivy-prichiny-i-resheniya',
    categoryName: 'Кабинет гинеколога',
    publishedAt: '2024-12-15',
    readTime: 8,
    image: '/article_1.png',
    gradient: 'from-primary-purple/40 via-ocean-wave-start/30 to-warm-accent/20',
  },
  'zgt-pokazaniya-i-protivopokazaniya': {
    id: 2,
    title: 'ЗГТ: показания и противопоказания',
    excerpt: 'Полное руководство по заместительной гормональной терапии при менопаузе.',
    slug: 'zgt-pokazaniya-i-protivopokazaniya',
    categoryName: 'Кабинет гинеколога',
    publishedAt: '2024-12-10',
    readTime: 12,
    image: '/article_2.png',
    gradient: 'from-warm-accent/40 via-primary-purple/30 to-ocean-wave-end/20',
  },
  'pitanie-v-menopauze': {
    id: 3,
    title: 'Питание в менопаузе: базовые принципы',
    excerpt: 'Как правильно питаться в период менопаузы для поддержания здоровья и веса.',
    slug: 'pitanie-v-menopauze',
    categoryName: 'Кухня нутрициолога',
    publishedAt: '2024-12-05',
    readTime: 10,
    image: '/article_3.png',
    gradient: 'from-ocean-wave-start/40 via-primary-purple/30 to-warm-accent/20',
  },
}

export const TopicArticles: FC<TopicArticlesProps> = ({ articleSlugs = [] }) => {
  // Фильтруем статьи по slug
  const articles = articleSlugs
    .map(slug => allArticles[slug])
    .filter(Boolean) as Article[]

  if (!articles || articles.length === 0) {
    return <></>
  }

  return (
    <section className="py-12 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-h3 font-bold text-deep-navy mb-2">Статьи по теме</h2>
          <p className="text-body text-deep-navy/70">
            Научно обоснованные материалы от экспертов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/blog/${article.slug}`}
                className="group block h-full"
              >
                <div className="bg-soft-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border border-lavender-bg">
                  {/* Image */}
                  <div className="w-full h-48 relative overflow-hidden bg-lavender-bg">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t ${article.gradient}`} />
                    
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-primary-purple text-body-small font-semibold rounded-full shadow-sm text-xs">
                        {article.categoryName}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-h6 font-semibold text-deep-navy mb-2 group-hover:text-primary-purple transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-body-small text-deep-navy/70 mb-4 flex-grow line-clamp-2">
                      {article.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-body-small text-deep-navy/60 pt-4 border-t border-lavender-bg">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(article.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{article.readTime} мин</span>
                      </div>
                    </div>

                    {/* Link */}
                    <div className="flex items-center gap-2 text-primary-purple group-hover:gap-3 transition-all mt-3">
                      <span className="text-body-small font-medium">Читать статью</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

