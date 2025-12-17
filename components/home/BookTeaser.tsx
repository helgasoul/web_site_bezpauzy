import { FC } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface BookTeaserProps {}

export const BookTeaser: FC<BookTeaserProps> = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-primary text-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Book Cover */}
          <div className="relative lg:order-1 order-2">
            <div className="relative w-full max-w-md mx-auto aspect-[2/3] rounded-card shadow-2xl transform hover:scale-105 transition-transform duration-300 overflow-hidden">
              <Image
                src="/oblozhka.png"
                alt="Обложка книги Менопауза Без|паузы"
                fill
                className="object-cover"
                priority
              />
              {/* Text overlay on cover */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                <h3 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-2xl leading-tight tracking-tight">
                  МЕНОПАУЗА БЕЗ|ПАУЗЫ
                </h3>
                <p className="font-inter text-sm md:text-base text-white/95 drop-shadow-lg font-light italic tracking-wide">
                  новая жизнь-прежняя ты
                </p>
              </div>
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-6 lg:order-2 order-1">
            <h2 className="text-h2 font-bold text-soft-white">
              КНИГА "МЕНОПАУЗА БЕЗ|ПАУЗЫ"
            </h2>
            <p className="text-body-large text-soft-white/90">
              Новая жизнь - прежняя ты
            </p>
            <div className="flex flex-wrap gap-4 text-body text-soft-white/80">
              <span>📖 280 страниц</span>
              <span>🔬 100+ научных источников</span>
              <span>💜 10 глав</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book">
                <Button variant="ghost" className="w-full sm:w-auto">
                  Предзаказать книгу →
                </Button>
              </Link>
            </div>
            <p className="text-body-small text-soft-white/70">
              Выход весной 2026
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
