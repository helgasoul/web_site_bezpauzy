'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, ArrowLeft, User, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import Image from 'next/image'

interface Review {
  id: string
  author: string
  role?: string
  rating: number
  text: string
  date?: string
  isExpert?: boolean
  avatar?: string
}

const reviews: Review[] = [
  {
    id: '1',
    author: 'Елена, 48 лет',
    role: 'Читатель',
    rating: 5,
    text: 'Наконец-то книга, которая объясняет менопаузу научно, но доступно. Я поняла, что происходит с моим телом и почему. Особенно помогла глава о приливах — теперь я знаю, как с ними справляться.',
    date: '2024',
    isExpert: false,
  },
  {
    id: '2',
    author: 'Мария, 52 года',
    role: 'Читатель',
    rating: 5,
    text: 'Читала с карандашом в руках. Много практических советов, которые можно применить сразу. Автор не пугает, а объясняет. После прочтения чувствую себя увереннее.',
    date: '2024',
    isExpert: false,
  },
  {
    id: '3',
    author: 'Анна, 45 лет',
    role: 'Читатель',
    rating: 5,
    text: 'Книга изменила мое отношение к менопаузе. Вместо страха теперь понимание. Особенно ценна глава о психологии трансформации — помогла принять изменения.',
    date: '2024',
    isExpert: false,
  },
  {
    id: '4',
    author: 'Доктор Натия Шамугия',
    role: 'Гинеколог-эндокринолог',
    rating: 5,
    text: 'Как практикующий врач, я рекомендую эту книгу своим пациенткам. Научно обоснованная информация, поданная доступным языком. Автор не упрощает, а объясняет сложные процессы понятно.',
    date: '2024',
    isExpert: true,
  },
  {
    id: '5',
    author: 'Светлана, 50 лет',
    role: 'Читатель',
    rating: 5,
    text: 'Много лет искала информацию о менопаузе. Эта книга — то, что нужно. Все по делу, без лишней воды. Главы о ЗГТ и альтернативных методах помогли принять решение.',
    date: '2024',
    isExpert: false,
  },
  {
    id: '6',
    author: 'Ольга, 47 лет',
    role: 'Читатель',
    rating: 5,
    text: 'Книга стала моим навигатором в период менопаузы. Особенно полезны практические инструменты из последней главы. Рекомендую всем женщинам 40+.',
    date: '2024',
    isExpert: false,
  },
]

export const BookReviewsPage: FC = () => {
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary-purple to-ocean-wave-start overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/90 to-ocean-wave-start/90" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Quote className="w-5 h-5 text-white" />
              <span className="text-body-small font-semibold text-white">Отзывы читателей</span>
            </div>
            <h1 className="text-h1 md:text-display font-bold text-white mb-6 drop-shadow-lg">
              Что говорят о книге
            </h1>
            <p className="text-body-large text-white/95 mb-8 drop-shadow-md">
              Отзывы тех, кто уже прочитал &quot;Менопауза: Новое видение&quot;
            </p>
            
            {/* Average Rating */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.round(averageRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-h3 font-bold text-white">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-body text-white/80">
                ({reviews.length} {reviews.length === 1 ? 'отзыв' : reviews.length < 5 ? 'отзыва' : 'отзывов'})
              </span>
            </div>

            <Link href="/book">
              <Button variant="ghost" className="bg-white text-primary-purple hover:bg-white/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к книге
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-white rounded-3xl p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border ${
                  review.isExpert ? 'border-primary-purple/30' : 'border-lavender-bg'
                } flex flex-col h-full`}
              >
                {/* Author Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    review.isExpert 
                      ? 'bg-gradient-to-br from-primary-purple/20 to-ocean-wave-start/20' 
                      : 'bg-lavender-bg'
                  }`}>
                    {review.isExpert ? (
                      <Award className="w-6 h-6 text-primary-purple" />
                    ) : (
                      <User className="w-6 h-6 text-deep-navy/60" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-h5 font-semibold text-deep-navy mb-1">
                      {review.author}
                    </h3>
                    {review.role && (
                      <p className="text-body-small text-deep-navy/60">
                        {review.role}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-deep-navy/20'
                      }`}
                    />
                  ))}
                </div>

                {/* Review Text */}
                <div className="flex-1 mb-4">
                  <Quote className="w-6 h-6 text-primary-purple/30 mb-2" />
                  <p className="text-body text-deep-navy/80 leading-relaxed">
                    {review.text}
                  </p>
                </div>

                {/* Date */}
                {review.date && (
                  <p className="text-body-small text-deep-navy/50 mt-auto">
                    {review.date}
                  </p>
                )}

                {/* Expert Badge */}
                {review.isExpert && (
                  <div className="mt-4 pt-4 border-t border-lavender-bg">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-purple/10 text-primary-purple text-body-small font-semibold rounded-full">
                      <Award className="w-3 h-3" />
                      Эксперт
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-body-large text-deep-navy/70 mb-6">
              Хотите оставить свой отзыв?
            </p>
            <Link href="/book">
              <Button variant="primary" className="px-8">
                Предзаказать книгу →
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}

