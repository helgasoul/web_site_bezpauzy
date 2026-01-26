'use client'

import { FC, useEffect } from 'react'
import { User, Heart, Star } from 'lucide-react'
import { initFadeInAnimations } from '@/lib/utils/intersection-observer'

interface TestimonialDisplay {
  quote: string
  author_name: string
  iconName: 'User' | 'Heart' | 'Star'
  gradient: string
  rating?: number
}

interface TestimonialsClientProps {
  testimonials: TestimonialDisplay[]
}

export const TestimonialsClient: FC<TestimonialsClientProps> = ({ testimonials }) => {
  useEffect(() => {
    // Инициализируем анимации при монтировании компонента
    initFadeInAnimations()
  }, [])

  // Маппинг имён иконок на компоненты (только в Client Component)
  const iconMap = {
    User,
    Heart,
    Star,
  }

  return (
    <section className="py-16 md:py-24 bg-lavender-bg">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-h2 font-bold text-deep-navy text-center mb-12">
          Что говорят наши пользователи
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => {
            const Icon = iconMap[testimonial.iconName]
            return (
              <div
                key={index}
                className={`bg-soft-white rounded-card p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 fade-in ${index === 0 ? 'fade-in-delay-1' : index === 1 ? 'fade-in-delay-2' : 'fade-in-delay-3'}`}
              >
                {/* Author icon */}
                <div className="flex justify-center mb-6">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-medium`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Rating (если есть) */}
                {testimonial.rating && (
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating!
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-deep-navy/20'
                        }`}
                      />
                    ))}
                  </div>
                )}

                <div className="text-quote font-accent text-deep-navy mb-6 text-center">
                  {'"'}{testimonial.quote}{'"'}
                </div>
                <div className="text-body-small text-deep-navy/70 text-center">
                  — {testimonial.author_name}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

