'use client'

import { FC, useEffect } from 'react'
import Image from 'next/image'
import { initFadeInAnimations } from '@/lib/utils/intersection-observer'

interface SocialProofProps {}

export const SocialProof: FC<SocialProofProps> = () => {
  useEffect(() => {
    // Инициализируем анимации при монтировании компонента
    initFadeInAnimations()
  }, [])

  const stats = [
    { 
      value: '12,000+', 
      label: 'женщин с нами', 
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&q=80' 
    },
    { 
      value: '4.8/5', 
      label: 'рейтинг', 
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&q=80' 
    },
    { 
      value: '500+', 
      label: 'врачей в базе', 
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&q=80' 
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-soft-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center space-y-4 fade-in ${index === 0 ? 'fade-in-delay-1' : index === 1 ? 'fade-in-delay-2' : 'fade-in-delay-3'}`}
            >
              {/* Photo */}
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden shadow-strong border-4 border-white">
                <Image
                  src={stat.image}
                  alt={stat.label}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="text-h2 font-bold text-primary-purple">
                {stat.value}
              </div>
              <div className="text-body text-deep-navy/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

