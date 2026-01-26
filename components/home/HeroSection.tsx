'use client'

import { FC, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Heart, Shield } from 'lucide-react'
import { initFadeInAnimations } from '@/lib/utils/intersection-observer'

interface HeroSectionProps {}

export const HeroSection: FC<HeroSectionProps> = () => {
  useEffect(() => {
    // Инициализируем анимации при монтировании
    initFadeInAnimations()
  }, [])

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Главная секция"
    >
      {/* Warm gradient background with texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-purple via-ocean-wave-start to-warm-accent/30">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-warm-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ocean-wave-end/15 rounded-full blur-3xl" />
      </div>

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-20 md:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <div 
            className="text-center lg:text-left space-y-8 fade-in-element"
            style={{ transitionDelay: '0s' }}
          >
            {/* Trust badge */}
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 scale-in-element"
              style={{ transitionDelay: '0.2s' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">12,000+ женщин доверяют нам</span>
            </div>

            {/* H1 with warm accent */}
            <h1
              className="font-montserrat text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6 fade-in-element"
              style={{ transitionDelay: '0.3s' }}
            >
              <span className="text-white drop-shadow-lg">Твоя энергия</span>
              <br />
              <span className="text-warm-accent drop-shadow-lg">— без паузы</span>
            </h1>

            {/* Rich subtitle */}
            <p
              className="font-inter text-xl md:text-2xl lg:text-3xl font-normal text-white/95 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10 fade-in-element"
              style={{ transitionDelay: '0.5s' }}
            >
              Научно обоснованная поддержка для женщин 40+.
              <span className="block mt-2 text-white/80 text-lg md:text-xl">
                Поддержка ассистента Евы 24/7, статьи, гайды, книги
              </span>
            </p>

            {/* CTA Button with warm styling */}
            <div
              className="flex flex-col sm:flex-row gap-4 items-center lg:items-start fade-in-element"
              style={{ transitionDelay: '0.7s' }}
            >
              <Link
                href="/blog"
                className="group inline-flex items-center gap-3 bg-white text-primary-purple px-10 py-5 rounded-full text-lg md:text-xl font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300 hover:bg-warm-accent/10 hover:text-white border-2 border-white/20"
                aria-label="Открыть журнал"
              >
                <span>Начать бесплатно</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              {/* Trust indicators */}
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Безопасно</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  <span>С заботой</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Rich Visual with Image */}
          <div
            className="relative w-full max-w-2xl mx-auto lg:mx-0 fade-in-element"
            style={{ transitionDelay: '0.4s' }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-warm-accent/30 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary-purple/30 rounded-full blur-2xl" />
            
            {/* Main image container with warm styling */}
            <div className="relative">
              {/* Image frame with gradient border */}
              <div className="relative rounded-3xl overflow-hidden shadow-strong border-4 border-white/40 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm">
                {/* Image or placeholder */}
                <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-primary-purple/40 via-ocean-wave-start/30 to-warm-accent/20">
                  <Image
                    src="/hero-women.jpg"
                    alt="Женщины 40+ - наша аудитория"
                    width={800}
                    height={1000}
                    className="object-cover w-full h-full mix-blend-overlay opacity-90"
                    priority
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  {/* Overlay gradient for warmth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-warm-accent/20 via-transparent to-transparent" />
                  
                  {/* Decorative elements inside */}
                  <div className="absolute top-6 right-6 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Floating stats cards */}
              <div
                className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-strong border border-white/50 fade-in-element"
                style={{ transitionDelay: '1s' }}
              >
                <div className="text-2xl font-bold text-primary-purple">12K+</div>
                <div className="text-xs text-deep-navy/70">Активных пользователей</div>
              </div>

              <div
                className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-strong border border-white/50 fade-in-element"
                style={{ transitionDelay: '1.2s' }}
              >
                <div className="text-2xl font-bold text-warm-accent">24/7</div>
                <div className="text-xs text-deep-navy/70">Поддержка Евы</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

