'use client'

import { FC } from 'react'
import { Shield, CheckCircle, FileText, Users } from 'lucide-react'
import { motion } from 'framer-motion'

interface BotTrustProps {}

export const BotTrust: FC<BotTrustProps> = () => {
  const trustItems = [
    {
      icon: Shield,
      title: 'Все данные зашифрованы',
      description: 'Соответствие ФЗ-152 о защите персональных данных',
    },
    {
      icon: CheckCircle,
      title: 'Проверено врачами',
      description: 'Все ответы проверяются медицинскими экспертами',
    },
    {
      icon: FileText,
      title: 'Научные источники',
      description: 'База знаний на основе актуальных исследований',
    },
    {
      icon: Users,
      title: '12,000+ пользователей',
      description: 'Доверяют Еве каждый день',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.h2
          className="text-h2 font-bold text-deep-navy text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Безопасность и конфиденциальность
        </motion.h2>
        
        <motion.p
          className="text-body-large text-deep-navy/70 text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Ваши данные в безопасности. Мы соблюдаем все требования законодательства.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustItems.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-h5 font-semibold text-deep-navy">
                  {item.title}
                </h3>
                <p className="text-body-small text-deep-navy/70">
                  {item.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <a
            href="/privacy"
            className="text-body text-primary-purple hover:underline"
          >
            Политика конфиденциальности →
          </a>
        </motion.div>
      </div>
    </section>
  )
}






