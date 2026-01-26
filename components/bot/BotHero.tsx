'use client'

import { FC, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { assetUrl } from '@/lib/assets'

interface BotHeroProps {}

export const BotHero: FC<BotHeroProps> = () => {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)

  const handleStartDialog = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsChecking(true)

    try {
      // Всегда ведем в чат - там ChatAuthGate проверит авторизацию и покажет нужный экран
      router.push('/chat')
    } catch (error) {
      // В случае ошибки просто переходим в чат
      router.push('/chat')
    } finally {
      setIsChecking(false)
    }
  }
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-lavender">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-ocean-wave-start/15 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-20 md:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text Content */}
          <motion.div 
            className="text-center lg:text-left space-y-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-purple/10 backdrop-blur-md rounded-full border border-primary-purple/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MessageCircle className="w-4 h-4 text-primary-purple" />
              <span className="text-sm font-medium text-primary-purple">AI-консультант 24/7</span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              className="font-montserrat text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="text-deep-navy">Ева — ваш</span>
              <br />
              <span className="text-primary-purple">AI-консультант</span>
              <br />
              <span className="text-deep-navy">по менопаузе</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="font-inter text-xl md:text-2xl font-normal text-deep-navy/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              24/7 отвечает на вопросы, рекомендует врачей, подбирает видео и поддерживает.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col gap-4 items-center lg:items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start">
                <button
                  onClick={handleStartDialog}
                  disabled={isChecking}
                  className="group inline-flex items-center gap-3 bg-primary-purple text-white px-10 py-5 rounded-full text-lg md:text-xl font-semibold hover:shadow-strong hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isChecking ? 'Проверка...' : 'Начать диалог'}</span>
                  {!isChecking && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
                
                <Link
                  href="#example"
                  className="text-body text-deep-navy/70 hover:text-primary-purple transition-colors underline"
                >
                  Посмотреть пример диалога
                </Link>
              </div>
              
              <p className="text-body-small text-deep-navy/70 max-w-2xl mx-auto lg:mx-0 pt-2 border-t border-deep-navy/10">
                Начиная общение с Евой, вы соглашаетесь с{' '}
                <Link href="/bot/terms" target="_blank" rel="noopener noreferrer" className="text-primary-purple hover:underline transition-colors">
                  пользовательским соглашением
                </Link>
                {' '}и{' '}
                <Link href="/bot/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-purple hover:underline transition-colors">
                  политикой конфиденциальности
                </Link>
                {' '}Telegram-бота.
              </p>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="flex flex-wrap items-center gap-6 text-sm text-deep-navy/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-purple" />
                <span>На основе науки</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🩺</span>
                <span>Проверено врачами</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>Конфиденциально</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Visual with Photo */}
          <motion.div
            className="relative w-full max-w-xs mx-auto lg:mx-0"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-purple/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-ocean-wave-start/20 rounded-full blur-2xl" />
            
            {/* Photo with overlay */}
            <div className="relative rounded-3xl overflow-hidden shadow-strong aspect-[2/3] max-h-[500px]">
              <div className="relative w-full h-full">
                <Image
                  src={assetUrl('/oblozhka.png')}
                  alt="Обложка книги Менопауза Без |Паузы"
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-purple/40 via-transparent to-transparent" />
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}

