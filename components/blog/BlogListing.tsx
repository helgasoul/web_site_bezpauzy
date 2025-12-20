'use client'

import { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, Search, Activity, Heart, UtensilsCrossed } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface BlogListingProps {}

export const BlogListing: FC<BlogListingProps> = () => {
  // Placeholder data - will be replaced with Supabase data
  const categories = [
    { id: 'all', name: 'Все статьи', count: 24 },
    { id: 'gynecologist', name: 'Кабинет гинеколога', count: 10 },
    { id: 'mammologist', name: 'Разговор с маммологом', count: 8 },
    { id: 'nutritionist', name: 'Кухня нутрициолога', count: 6 },
  ]

  const articles = [
    {
      id: 1,
      title: 'Приливы: причины и 10 способов облегчения',
      excerpt: 'Узнайте, почему возникают приливы и как можно облегчить этот симптом менопаузы. Практические советы от гинеколога.',
      category: 'gynecologist',
      categoryName: 'Кабинет гинеколога',
      slug: 'prilivy-prichiny-i-resheniya',
      author: {
        name: 'Др. Анна Иванова',
        role: 'Гинеколог-эндокринолог',
        avatar: '/hero-women.jpg', // Placeholder
      },
      publishedAt: '2024-12-15',
      readTime: 8,
      image: '/article_1.png',
      gradient: 'from-primary-purple/40 via-ocean-wave-start/30 to-warm-accent/20',
    },
    {
      id: 2,
      title: 'ЗГТ: показания и противопоказания',
      excerpt: 'Полное руководство по заместительной гормональной терапии при менопаузе. Когда нужна ЗГТ, а когда нет.',
      category: 'gynecologist',
      categoryName: 'Кабинет гинеколога',
      slug: 'zgt-pokazaniya-i-protivopokazaniya',
      author: {
        name: 'Др. Анна Иванова',
        role: 'Гинеколог-эндокринолог',
        avatar: '/hero-women.jpg',
      },
      publishedAt: '2024-12-10',
      readTime: 12,
      image: '/article_2.png',
      gradient: 'from-warm-accent/40 via-primary-purple/30 to-ocean-wave-end/20',
    },
    {
      id: 3,
      title: 'Питание в менопаузе: базовые принципы',
      excerpt: 'Как правильно питаться в период менопаузы для поддержания здоровья и веса. Меню на неделю и рецепты.',
      category: 'nutritionist',
      categoryName: 'Кухня нутрициолога',
      slug: 'pitanie-v-menopauze',
      author: {
        name: 'Др. Мария Петрова',
        role: 'Нутрициолог',
        avatar: '/hero-women.jpg',
      },
      publishedAt: '2024-12-05',
      readTime: 10,
      image: '/article_3.png',
      gradient: 'from-ocean-wave-start/40 via-primary-purple/30 to-warm-accent/20',
    },
    {
      id: 4,
      title: 'Маммография после 40: что нужно знать',
      excerpt: 'Когда и как часто делать маммографию в период менопаузы. Разбираемся с плотной тканью и факторами риска.',
      category: 'mammologist',
      categoryName: 'Разговор с маммологом',
      slug: 'mammografiya-posle-40',
      author: {
        name: 'Др. Елена Смирнова',
        role: 'Маммолог',
        avatar: '/hero-women.jpg',
      },
      publishedAt: '2024-11-28',
      readTime: 7,
      image: '/article_4.png',
      gradient: 'from-primary-purple/40 via-warm-accent/30 to-ocean-wave-end/20',
    },
    {
      id: 5,
      title: 'Бессонница в менопаузе: почему возникает и как наладить сон',
      excerpt: 'Нарушения сна — частый спутник менопаузы. Узнайте о причинах и эффективных способах улучшить качество сна.',
      category: 'gynecologist',
      categoryName: 'Кабинет гинеколога',
      slug: 'bessonnitsa-v-menopauze',
      author: {
        name: 'Др. Анна Иванова',
        role: 'Гинеколог-эндокринолог',
        avatar: '/hero-women.jpg',
      },
      publishedAt: '2024-11-20',
      readTime: 9,
      image: '/article_5.png',
      gradient: 'from-ocean-wave-start/40 via-warm-accent/30 to-primary-purple/20',
    },
    {
      id: 6,
      title: 'Вес и метаболизм в менопаузе: почему мы набираем вес',
      excerpt: 'Почему в менопаузе так сложно контролировать вес? Научное объяснение и практические рекомендации.',
      category: 'nutritionist',
      categoryName: 'Кухня нутрициолога',
      slug: 'ves-i-metabolizm-v-menopauze',
      author: {
        name: 'Др. Мария Петрова',
        role: 'Нутрициолог',
        avatar: '/hero-women.jpg',
      },
      publishedAt: '2024-11-15',
      readTime: 11,
      image: '/article_6.png',
      gradient: 'from-warm-accent/40 via-ocean-wave-start/30 to-primary-purple/20',
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <section className="py-8 md:py-16 bg-soft-white">
      {/* Hero Section */}
      <div className="relative py-16 md:py-24 mb-12 md:mb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/ChatGPT Image Dec 17, 2025 at 09_35_22 PM.png"
            alt="Журнал — статьи о менопаузе"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-deep-navy/60 via-deep-navy/40 to-deep-navy/60" />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-h1 md:text-display font-bold text-white mb-6 drop-shadow-lg">
              Журнал
            </h1>
            <p className="text-body-large text-white/95 mb-8 drop-shadow-md">
              Научно обоснованные статьи о менопаузе от гинекологов, маммологов и нутрициологов
            </p>
            
            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-deep-navy/40 z-10" />
              <input
                type="text"
                placeholder="Поиск статей..."
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-white/30 focus:border-primary-purple focus:outline-none bg-white/95 backdrop-blur-sm shadow-card"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Category Filters */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-6 py-3 rounded-full text-body font-medium transition-all duration-300 ${
                  category.id === 'all'
                    ? 'bg-primary-purple text-white shadow-button'
                    : 'bg-white text-deep-navy hover:bg-lavender-bg border border-lavender-bg'
                }`}
              >
                {category.name}
                <span className="ml-2 text-body-small opacity-70">
                  ({category.count})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article, index) => (
            <motion.article
              key={article.id}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/blog/${article.slug}`}>
                <div className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-lavender-bg h-full flex flex-col">
                  {/* Image */}
                  <div className={`relative w-full h-60 bg-gradient-to-br ${article.gradient} overflow-hidden`}>
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                    />
                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-primary-purple text-body-small font-semibold rounded-full">
                        {article.categoryName}
                      </span>
                    </div>
                    {/* Wavy bottom edge */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-12 bg-white"
                      style={{
                        clipPath:
                          'polygon(0 0, 100% 0, 100% 85%, 95% 90%, 85% 92%, 75% 90%, 65% 88%, 55% 90%, 45% 92%, 35% 90%, 25% 88%, 15% 90%, 5% 88%, 0 85%)',
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-h5 font-semibold text-deep-navy mb-3 group-hover:text-primary-purple transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-body-small text-deep-navy/70 mb-4 line-clamp-3 flex-1">
                      {article.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-caption text-deep-navy/60 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime} мин</span>
                        </div>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-lavender-bg">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={article.author.avatar}
                          alt={article.author.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-body-small font-medium text-deep-navy truncate">
                          {article.author.name}
                        </div>
                        <div className="text-caption text-deep-navy/60 truncate">
                          {article.author.role}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary-purple group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Load More / Pagination */}
        <div className="text-center">
          <Button variant="secondary" className="px-8">
            Загрузить ещё статьи
          </Button>
        </div>
      </div>
    </section>
  )
}

