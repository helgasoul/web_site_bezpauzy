'use client'

import { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface RelatedArticlesProps {
  currentSlug: string
  category: string
}

export const RelatedArticles: FC<RelatedArticlesProps> = ({ currentSlug, category }) => {
  // Placeholder data - will be replaced with Supabase query
  const relatedArticles = [
    {
      id: 2,
      title: 'ЗГТ: показания и противопоказания',
      slug: 'zgt-pokazaniya-i-protivopokazaniya',
      excerpt: 'Полное руководство по заместительной гормональной терапии при менопаузе.',
      categoryName: 'Кабинет гинеколога',
      image: '/hero-women.jpg',
      gradient: 'from-warm-accent/40 via-primary-purple/30 to-ocean-wave-end/20',
    },
    {
      id: 5,
      title: 'Бессонница в менопаузе: почему возникает и как наладить сон',
      slug: 'bessonnitsa-v-menopauze',
      excerpt: 'Нарушения сна — частый спутник менопаузы. Узнайте о причинах и эффективных способах.',
      categoryName: 'Кабинет гинеколога',
      image: '/hero-women.jpg',
      gradient: 'from-ocean-wave-start/40 via-warm-accent/30 to-primary-purple/20',
    },
    {
      id: 6,
      title: 'Вес и метаболизм в менопаузе: почему мы набираем вес',
      slug: 'ves-i-metabolizm-v-menopauze',
      excerpt: 'Почему в менопаузе так сложно контролировать вес? Научное объяснение и рекомендации.',
      categoryName: 'Кухня нутрициолога',
      image: '/hero-women.jpg',
      gradient: 'from-warm-accent/40 via-ocean-wave-start/30 to-primary-purple/20',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-lavender-bg">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.h2
          className="text-h2 font-bold text-deep-navy text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Читайте также
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {relatedArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/blog/${article.slug}`}>
                <div className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border border-lavender-bg h-full flex flex-col">
                  {/* Image */}
                  <div className={`relative w-full h-48 bg-gradient-to-br ${article.gradient} overflow-hidden`}>
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover opacity-80"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-primary-purple text-body-small font-semibold rounded-full">
                        {article.categoryName}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-h5 font-semibold text-deep-navy mb-3 group-hover:text-primary-purple transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-body-small text-deep-navy/70 mb-4 line-clamp-3 flex-1">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-primary-purple font-medium text-body-small mt-auto">
                      <span>Читать далее</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
