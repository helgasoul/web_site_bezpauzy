'use client'

import { FC } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BookOpen, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BookHeroProps {}

export const BookHero: FC<BookHeroProps> = () => {
  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary-purple to-ocean-wave-start overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/90 to-ocean-wave-start/90" />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Book Cover */}
          <motion.div
            className="relative lg:order-1 order-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full max-w-md mx-auto aspect-[2/3] rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300 overflow-hidden">
              <Image
                src="/oblozhka.png"
                alt="Обложка книги Менопауза: Новое видение"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 448px"
                className="object-cover"
                priority
              />
              {/* Gradient overlay for better readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              {/* Book title overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-8 text-center z-10">
                <h3 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 drop-shadow-2xl leading-tight tracking-tight">
                  МЕНОПАУЗА:
                </h3>
                <h3 className="font-playfair text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4 drop-shadow-2xl leading-tight tracking-tight">
                  НОВОЕ ВИДЕНИЕ
                </h3>
                <p className="font-inter text-xs md:text-sm lg:text-base text-white/95 drop-shadow-lg font-light italic tracking-wide">
                  новая жизнь-прежняя ты
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            className="space-y-6 lg:order-2 order-1 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-body-small font-semibold text-white">
                Выход весной 2026
              </span>
            </div>

            {/* Title */}
            <h1 className="text-h1 md:text-display font-bold text-white drop-shadow-lg">
              Менопауза: Новое видение
            </h1>

            {/* Subtitle */}
            <p className="text-body-large text-white/95 drop-shadow-md">
              Путешествие от страха к пониманию. Интеллектуальный гид по самой недопонятой трансформации женского тела.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-body text-white/90">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-white" />
                <span>280 страниц</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                <span>100+ научных источников</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span>12 глав</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                variant="ghost"
                className="bg-white text-primary-purple hover:bg-white/90 w-full sm:w-auto"
                onClick={() => {
                  document.getElementById('pre-order-form')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Добавить в корзину — 1,200₽ →
              </Button>
            </div>

            {/* Bonus */}
            <p className="text-body-small text-white/80">
              🎁 +1 месяц Paid1 подписки в боте в подарок
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

