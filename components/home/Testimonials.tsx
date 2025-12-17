'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { User, Heart, Star } from 'lucide-react'

interface TestimonialsProps {}

export const Testimonials: FC<TestimonialsProps> = () => {
  // Placeholder testimonials - will be replaced with real data
  const testimonials = [
    {
      quote: 'Ева помогла мне понять, что происходит с моим телом. Теперь я знаю, что делать.',
      author: 'Анна, 48 лет, Москва',
      icon: User,
      gradient: 'from-primary-purple to-ocean-wave-start',
    },
    {
      quote: 'Наконец-то нашла научно обоснованную информацию о менопаузе. Спасибо!',
      author: 'Елена, 52 года, СПб',
      icon: Heart,
      gradient: 'from-warm-accent to-primary-purple',
    },
    {
      quote: 'Ассистент Ева стал моим постоянным помощником. Очень удобно и информативно.',
      author: 'Светлана, 45 лет, Казань',
      icon: Star,
      gradient: 'from-ocean-wave-start to-warm-accent',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-lavender-bg">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h2 className="text-h2 font-bold text-deep-navy text-center mb-12">
          Что говорят наши пользователи
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-soft-white rounded-card p-8 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Author icon */}
              <div className="flex justify-center mb-6">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-medium`}>
                  <testimonial.icon className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="text-quote font-accent text-deep-navy mb-6 text-center">
                "{testimonial.quote}"
              </div>
              <div className="text-body-small text-deep-navy/70 text-center">
                — {testimonial.author}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
