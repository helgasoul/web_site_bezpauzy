'use client'

import { FC } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Activity, TrendingUp, Heart, Lightbulb, BookOpen, HeartPulse, Sparkles } from 'lucide-react'
import type { KnowledgeBaseCategory } from '@/lib/types/knowledge-base'
import type { LucideIcon } from 'lucide-react'

interface CategoryCardProps {
  category: KnowledgeBaseCategory
  index: number
}

// Маппинг категорий на иконки Lucide (надежные и всегда работают)
const categoryIconMap: Record<string, LucideIcon> = {
  'symptoms': Activity,
  'stages': TrendingUp,
  'treatment': HeartPulse,
  'myths': Sparkles,
}

// Маппинг названий иконок на компоненты Lucide (для обратной совместимости)
const lucideIconMap: Record<string, LucideIcon> = {
  Activity,
  TrendingUp,
  Heart,
  Lightbulb,
  BookOpen,
  HeartPulse,
  Sparkles,
}

export const CategoryCard: FC<CategoryCardProps> = ({ category, index }) => {
  // Используем специальную иконку для категории или fallback на стандартную
  const CategoryIcon = categoryIconMap[category.slug] || lucideIconMap[category.icon] || BookOpen

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link
        href={`/knowledge-base/${category.slug}`}
        className="group block h-full"
      >
        <div className="bg-soft-white rounded-card p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
          {/* Icon with gradient background and glow effect */}
          <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${category.gradientFrom} ${category.gradientTo} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-2xl overflow-visible`} style={{
            boxShadow: `0 10px 30px -5px rgba(139, 125, 214, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset`
          }}>
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
            {/* Иконка категории */}
            <CategoryIcon 
              className="relative z-10 text-white shrink-0" 
              size={48}
              strokeWidth={2.5}
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                minWidth: '48px',
                minHeight: '48px'
              }}
            />
          </div>

          {/* Title */}
          <h3 className="text-h4 font-semibold text-deep-navy mb-3 group-hover:text-primary-purple transition-colors">
            {category.title}
          </h3>

          {/* Description */}
          <p className="text-body text-deep-navy/70 mb-6 flex-grow">
            {category.description}
          </p>

          {/* Topics count and link */}
          <div className="flex items-center justify-between pt-4 border-t border-lavender-bg">
            <span className="text-body-small text-deep-navy/60">
              {category.topics.length} {category.topics.length === 1 ? 'тема' : category.topics.length < 5 ? 'темы' : 'тем'}
            </span>
            <div className="flex items-center gap-2 text-primary-purple group-hover:gap-3 transition-all">
              <span className="text-body-small font-medium">Изучить</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

