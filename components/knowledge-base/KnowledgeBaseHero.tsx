'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search } from 'lucide-react'

interface KnowledgeBaseHeroProps {}

export const KnowledgeBaseHero: FC<KnowledgeBaseHeroProps> = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden min-h-[500px]">
      {/* Fallback градиент (на случай, если видео не загрузится) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-purple via-ocean-wave-start to-warm-accent/30 z-0" />
      
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-[1]"
      >
        <source src="/social_helgasoul_Elegant_abstract_illustration_of_gentle_waves_of_wa_2cfafba4-18e8-478c-92ca-924cc8c21cf1_0.mp4" type="video/mp4" />
      </video>

      {/* Overlay для читаемости текста */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/60 via-ocean-wave-start/60 to-warm-accent/40 z-[2]" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse z-[2]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-warm-accent/20 rounded-full blur-3xl animate-pulse z-[2]" style={{ animationDelay: '1s' }} />

      <div className="relative z-[3] container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-8">
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-sm font-medium text-white">База знаний</span>
            </div>

            <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Вся информация о менопаузе
              <br />
              <span className="text-warm-accent">в одном месте</span>
            </h1>

            <p className="font-inter text-lg md:text-xl text-white/95 max-w-2xl mx-auto mb-10">
              Статьи, гайды, чек-листы и интерактивные материалы — научно обоснованная информация, 
              собранная для вас экспертами
            </p>

            {/* Search placeholder */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-deep-navy/40" />
                <input
                  type="text"
                  placeholder="Поиск по базе знаний..."
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white/95 backdrop-blur-sm border-2 border-white/50 text-deep-navy placeholder:text-deep-navy/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white shadow-lg"
                  disabled
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-body-small text-deep-navy/40">
                  Скоро
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

