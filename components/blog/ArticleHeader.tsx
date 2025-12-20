'use client'

import { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Edit } from 'lucide-react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface Article {
  id: number
  title: string
  slug: string
  category: string
  categoryName: string
  author: {
    name: string
    role: string
    avatar: string
  }
  publishedAt: string
  updatedAt: string
  readTime: number
  image: string
}

interface ArticleHeaderProps {
  article: Article
}

export const ArticleHeader: FC<ArticleHeaderProps> = ({ article }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Журнал', href: '/blog' },
    { label: article.categoryName, href: `/blog?category=${article.category}` },
    { label: article.title, href: `/blog/${article.slug}` },
  ]

  return (
    <section className="bg-gradient-lavender py-12 md:py-16 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-purple/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-ocean-wave-start/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-body-small text-deep-navy/70">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-deep-navy font-medium">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-primary-purple transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Category Badge */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 bg-primary-purple text-white text-body-small font-semibold rounded-full">
            {article.categoryName}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-h1 md:text-display font-bold text-deep-navy mb-6 max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {article.title}
        </motion.h1>

        {/* Byline */}
        <motion.div
          className="flex flex-wrap items-center gap-6 text-body text-deep-navy/70 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-medium text-deep-navy">
                {article.author.name}
              </div>
              <div className="text-body-small">
                {article.author.role}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Опубликовано: {formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Время чтения: {article.readTime} мин</span>
            </div>
            {article.updatedAt !== article.publishedAt && (
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span>Обновлено: {formatDate(article.updatedAt)}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}






