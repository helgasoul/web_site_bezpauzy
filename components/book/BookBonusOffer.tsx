'use client'

import { FC } from 'react'
import { motion } from 'framer-motion'
import { Gift, Sparkles, MessageCircle } from 'lucide-react'

interface BookBonusOfferProps {}

export const BookBonusOffer: FC<BookBonusOfferProps> = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary-purple to-ocean-wave-start relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/90 to-ocean-wave-start/90" />
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Gift className="w-5 h-5 text-white" />
            <span className="text-body-small font-semibold text-white">Бонус при предзаказе</span>
          </div>

          <h2 className="text-h2 md:text-h1 font-bold text-white mb-6 drop-shadow-lg">
            Предзакажите книгу до 31 марта 2026
          </h2>

          <p className="text-body-large text-white/95 mb-8 drop-shadow-md max-w-2xl mx-auto">
            И получите подарок: 1 месяц подписки Paid1 в боте Ева (стоимость 599₽)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Sparkles className="w-10 h-10 text-white mx-auto mb-4" />
              <h3 className="text-h4 font-semibold text-white mb-2">Безлимитные вопросы</h3>
              <p className="text-body-small text-white/90">
                Полный доступ к AI-консультанту Ева
              </p>
            </motion.div>

            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MessageCircle className="w-10 h-10 text-white mx-auto mb-4" />
              <h3 className="text-h4 font-semibold text-white mb-2">Расширенные ответы</h3>
              <p className="text-body-small text-white/90">
                Научно обоснованные ответы на основе валидированной базы данных
              </p>
            </motion.div>

            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Gift className="w-10 h-10 text-white mx-auto mb-4" />
              <h3 className="text-h4 font-semibold text-white mb-2">Видео от экспертов</h3>
              <p className="text-body-small text-white/90">
                Базовые видео-курсы включены
              </p>
            </motion.div>
          </div>

          <p className="text-body-small text-white/80">
            Бонус активируется автоматически после оплаты предзаказа
          </p>
        </motion.div>
      </div>
    </section>
  )
}

