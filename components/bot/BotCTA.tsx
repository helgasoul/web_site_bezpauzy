'use client'

import { FC, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { assetUrl } from '@/lib/assets'

interface BotCTAProps {}

export const BotCTA: FC<BotCTAProps> = () => {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)

  const handleAskEvaClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsChecking(true)

    // Всегда ведем в чат - там ChatAuthGate проверит авторизацию и покажет нужный экран
    router.push('/chat')
    setIsChecking(false)
  }
  return (
    <section className="py-16 md:py-24 bg-deep-navy text-white relative overflow-hidden">
      {/* Wave pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="wave-bg" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-ocean-wave-start/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Photo - Circular Eva */}
          <motion.div
            className="relative w-full max-w-md mx-auto lg:mx-0 order-2 lg:order-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-strong">
              <Image
                src={assetUrl('/ChatGPT Image Dec 19, 2025 at 10_44_36 PM.png')}
                alt="Ева — ваш AI-консультант по менопаузе"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 384px"
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/60 via-deep-navy/20 to-transparent" />
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            className="text-center lg:text-left space-y-8 order-1 lg:order-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Начните прямо сейчас</span>
            </div>

            <h2 className="text-h2 md:text-display font-bold text-white">
              Готовы начать путь без паузы?
            </h2>
            
            <p className="text-body-large text-white/80 max-w-xl mx-auto lg:mx-0">
              Зарегистрируйтесь и получите доступ к Еве. Персонализированные ответы на основе международных медицинских исследований, рекомендации врачей и видео-курсы от экспертов.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <button
                onClick={handleAskEvaClick}
                disabled={isChecking}
                className="group inline-flex items-center gap-3 bg-white text-primary-purple px-10 py-5 rounded-full text-lg md:text-xl font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isChecking ? 'Проверка...' : 'Спросить Еву'}</span>
                {!isChecking && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>

            <p className="text-body-small text-white/60">
              или{' '}
              <Link href="/newsletter" className="underline hover:text-ocean-wave-start transition-colors">
                подпишитесь на рассылку
              </Link>
              {' '}для получения научных новостей
            </p>

            <p className="text-body-small text-white/70 max-w-xl mx-auto lg:mx-0 pt-4 border-t border-white/20">
              Начиная общение с Евой, вы соглашаетесь с{' '}
              <Link href="/bot/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-ocean-wave-start transition-colors">
                пользовательским соглашением
              </Link>
              {' '}и{' '}
              <Link href="/bot/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-ocean-wave-start transition-colors">
                политикой конфиденциальности
              </Link>
              {' '}Telegram-бота.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

