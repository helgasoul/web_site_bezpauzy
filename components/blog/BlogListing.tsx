'use client'

import { FC, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { getCategoryName, getCategoryOverlay } from '@/lib/utils/blog'
import { getExpertByCategory, getExpertByName } from '@/lib/experts'
import type { BlogPost } from '@/lib/blog/get-articles'
import type { ExpertCategory } from '@/lib/experts'

interface BlogListingProps {
  articles: BlogPost[]
  categoryCounts: {
    all: number
    gynecologist: number
    mammologist: number
    nutritionist: number
  }
}

export const BlogListing: FC<BlogListingProps> = ({ articles, categoryCounts }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gynecologist' | 'mammologist' | 'nutritionist'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(9) // Показываем первые 9 статей

  // Категории с подсчетом из пропсов
  const categories = [
    { id: 'all' as const, name: 'Все статьи', count: categoryCounts.all },
    { id: 'gynecologist' as const, name: 'Кабинет гинеколога', count: categoryCounts.gynecologist },
    { id: 'mammologist' as const, name: 'Разговор с маммологом', count: categoryCounts.mammologist },
    { id: 'nutritionist' as const, name: 'Кухня нутрициолога', count: categoryCounts.nutritionist },
  ]

  // Фильтрация статей
  const filteredArticles = useMemo(() => {
    let filtered = articles

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    // Фильтр по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        (article.metaKeywords && article.metaKeywords.some(keyword => keyword.toLowerCase().includes(query)))
      )
    }

    return filtered
  }, [articles, selectedCategory, searchQuery])

  // Статьи для отображения (с пагинацией)
  const displayedArticles = filteredArticles.slice(0, visibleCount)
  const hasMore = visibleCount < filteredArticles.length

  // Функция для получения градиента на основе категории
  const getGradient = (category: 'gynecologist' | 'mammologist' | 'nutritionist'): string => {
    const gradients: Record<'gynecologist' | 'mammologist' | 'nutritionist', string> = {
      gynecologist: 'from-primary-purple/40 via-ocean-wave-start/30 to-warm-accent/20',
      mammologist: 'from-primary-purple/40 via-warm-accent/30 to-ocean-wave-end/20',
      nutritionist: 'from-warm-accent/40 via-primary-purple/30 to-ocean-wave-start/20',
    }
    return gradients[category] || gradients.gynecologist
  }

  // Функция для получения автора (из данных статьи или через систему экспертов)
  const getAuthor = (article: BlogPost) => {
    // Пытаемся получить эксперта по категории или имени
    const expert = getExpertByCategory(article.category as ExpertCategory) || 
                   (article.authorName ? getExpertByName(article.authorName) : null)
    
    // Если эксперт найден, используем его данные (приоритет)
    if (expert) {
      return {
        name: expert.name,
        role: expert.role,
        avatar: expert.avatar,
      }
    }
    
    // Если есть данные автора из статьи, используем их
    if (article.authorName && article.authorRole) {
      return {
        name: article.authorName,
        role: article.authorRole,
        avatar: article.authorAvatar || '/hero-women.jpg',
      }
    }
    
    // Fallback на основе категории (если ничего не найдено)
    const fallbacks: Record<'gynecologist' | 'mammologist' | 'nutritionist', { name: string; role: string; avatar: string }> = {
      gynecologist: {
        name: 'Шамугия Натия',
        role: 'Гинеколог-эндокринолог, кандидат медицинских наук',
        avatar: '/shamugia-natiya.jpg',
      },
      mammologist: {
        name: 'Пучкова Ольга',
        role: 'Маммолог-онколог, врач-рентгенолог, сертифицированный специалист EUSOBI',
        avatar: '/puchkova-olga.png',
      },
      nutritionist: {
        name: 'Климкова Марина',
        role: 'Врач превентивной, интегративной и anti-age медицины, Нутрициолог, диетолог',
        avatar: '/marina-klimkova.jpg',
      },
    }
    return fallbacks[article.category] || fallbacks.gynecologist
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Дата не указана'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return 'Дата не указана'
    }
  }

  return (
    <section className="py-8 md:py-16 bg-soft-white">
      {/* Hero Section */}
      <div className="relative py-16 md:py-24 mb-12 md:mb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/journal page.png"
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
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setVisibleCount(9) // Сбрасываем пагинацию при новом поиске
                }}
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
                onClick={() => {
                  setSelectedCategory(category.id)
                  setVisibleCount(9) // Сбрасываем пагинацию при смене категории
                }}
                className={`px-6 py-3 rounded-full text-body font-medium transition-all duration-300 ${
                  selectedCategory === category.id
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

        {/* Results count */}
        {(selectedCategory !== 'all' || searchQuery.trim()) && (
          <div className="mb-6 text-center">
            <p className="text-body text-deep-navy/70">
              Найдено статей: <span className="font-semibold text-deep-navy">{filteredArticles.length}</span>
            </p>
          </div>
        )}

        {/* Articles Grid */}
        {displayedArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {displayedArticles.map((article, index) => {
                const author = getAuthor(article)
                const categoryName = article.categoryName || getCategoryName(article.category)
                const gradient = getGradient(article.category)
                const imageUrl = article.image || '/article_1.png'

                return (
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
                        <div className={`relative w-full h-60 bg-gradient-to-br ${gradient} overflow-hidden`}>
                          <Image
                            src={imageUrl}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                          />
                          {/* Category badge */}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-primary-purple text-body-small font-semibold rounded-full">
                              {categoryName}
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
                            {article.excerpt || ''}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center justify-between text-caption text-deep-navy/60 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(article.publishedAt)}</span>
                              </div>
                              {article.readTime && (
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  <span>{article.readTime} мин</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Author */}
                          <div className="flex items-center gap-3 pt-4 border-t border-lavender-bg">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-lavender-bg flex-shrink-0 shadow-sm">
                              <Image
                                src={author.avatar}
                                alt={author.name}
                                fill
                                className="object-cover"
                                style={{ objectPosition: 'center top' }}
                                sizes="48px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-body-small font-medium text-deep-navy truncate">
                                {author.name}
                              </div>
                              <div className="text-caption text-deep-navy/60 line-clamp-1">
                                {author.role}
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-primary-purple group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                )
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <Button 
                  variant="secondary" 
                  className="px-8"
                  onClick={() => setVisibleCount(prev => Math.min(prev + 9, filteredArticles.length))}
                >
                  Загрузить ещё статьи ({filteredArticles.length - visibleCount} осталось)
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-body-large text-deep-navy/70 mb-4">
              Статьи не найдены
            </p>
            {(selectedCategory !== 'all' || searchQuery.trim()) && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                  setVisibleCount(9)
                }}
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
