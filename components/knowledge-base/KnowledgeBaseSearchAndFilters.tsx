'use client'

import { FC, useState, useMemo } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { knowledgeBaseConfig } from '@/lib/knowledge-base/config'
import type { KnowledgeBaseCategory, KnowledgeBaseTopic } from '@/lib/types/knowledge-base'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface KnowledgeBaseSearchAndFiltersProps {
  onSearchChange?: (query: string) => void
  onCategoryFilter?: (categorySlug: string | null) => void
}

export const KnowledgeBaseSearchAndFilters: FC<KnowledgeBaseSearchAndFiltersProps> = ({
  onSearchChange,
  onCategoryFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Получаем все темы из всех категорий
  const allTopics = useMemo(() => {
    return knowledgeBaseConfig.flatMap(category => 
      category.topics.map(topic => ({
        ...topic,
        categoryTitle: category.title,
        categorySlug: category.slug,
        categoryIcon: category.icon,
      }))
    )
  }, [])

  // Фильтрация тем по поисковому запросу и категории
  const filteredTopics = useMemo(() => {
    let filtered = allTopics

    // Фильтр по категории
    if (selectedCategory) {
      filtered = filtered.filter(topic => topic.categorySlug === selectedCategory)
    }

    // Фильтр по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(topic => {
        const titleMatch = topic.title.toLowerCase().includes(query)
        const descriptionMatch = topic.description.toLowerCase().includes(query)
        return titleMatch || descriptionMatch
      })
    }

    return filtered
  }, [allTopics, searchQuery, selectedCategory])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearchChange?.(value)
  }

  const handleCategoryFilter = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug)
    onCategoryFilter?.(categorySlug)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory(null)
    onSearchChange?.('')
    onCategoryFilter?.(null)
  }

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== null

  return (
    <section className="py-8 md:py-12 bg-soft-white border-b border-lavender-bg">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Поиск по базе знаний..."
              className="w-full pl-12 pr-12 py-4 rounded-full border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-body text-deep-navy placeholder:text-deep-navy/40 transition-colors bg-white shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40 hover:text-deep-navy transition-colors"
                aria-label="Очистить поиск"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-lavender-bg hover:border-primary-purple transition-colors bg-white text-deep-navy"
              >
                <Filter className="w-4 h-4" />
                <span className="text-body-small font-medium">Фильтры</span>
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary-purple/20 hover:border-primary-purple/40 transition-colors bg-primary-purple/5 text-primary-purple text-body-small font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Сбросить</span>
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <div className="text-body-small text-deep-navy/60">
                Найдено: <span className="font-semibold text-primary-purple">{filteredTopics.length}</span> {filteredTopics.length === 1 ? 'тема' : filteredTopics.length < 5 ? 'темы' : 'тем'}
              </div>
            )}
          </div>

          {/* Category Filters */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-lavender-bg">
                  <button
                    onClick={() => handleCategoryFilter(null)}
                    className={`px-4 py-2 rounded-full text-body-small font-medium transition-all ${
                      selectedCategory === null
                        ? 'bg-primary-purple text-white shadow-md'
                        : 'bg-white text-deep-navy border-2 border-lavender-bg hover:border-primary-purple/40'
                    }`}
                  >
                    Все категории
                  </button>
                  {knowledgeBaseConfig.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.slug)}
                      className={`px-4 py-2 rounded-full text-body-small font-medium transition-all ${
                        selectedCategory === category.slug
                          ? 'bg-primary-purple text-white shadow-md'
                          : 'bg-white text-deep-navy border-2 border-lavender-bg hover:border-primary-purple/40'
                      }`}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Results */}
          {hasActiveFilters && filteredTopics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-h4 font-semibold text-deep-navy mb-4">
                Результаты поиска
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/knowledge-base/${topic.categorySlug}/${topic.slug}`}
                    className="group block bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border border-lavender-bg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="inline-block px-3 py-1 bg-primary-purple/10 text-primary-purple text-body-small font-semibold rounded-full mb-2">
                          {topic.categoryTitle}
                        </div>
                        <h4 className="text-h5 font-semibold text-deep-navy mb-2 group-hover:text-primary-purple transition-colors">
                          {topic.title}
                        </h4>
                        <p className="text-body-small text-deep-navy/70 line-clamp-2">
                          {topic.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary-purple opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* No Results */}
          {hasActiveFilters && filteredTopics.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-body-large text-deep-navy/70 mb-4">
                По вашему запросу ничего не найдено
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary-purple text-white rounded-full font-semibold hover:bg-primary-purple/90 transition-colors"
              >
                Сбросить фильтры
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

