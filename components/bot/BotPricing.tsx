'use client'

import { FC } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface BotPricingProps {}

export const BotPricing: FC<BotPricingProps> = () => {
  const plans = [
    {
      name: 'Paid1',
      price: '599₽',
      period: 'в месяц',
      description: 'Для активных пользователей',
      features: [
        '∞ вопросов в день',
        'Расширенные ответы',
        'Доступ к врачам',
        'Видео от экспертов',
        'Приоритетная поддержка',
      ],
      cta: 'Оплатить',
      ctaLink: 'https://t.me/bezpauzy_bot?start=paid1',
    },
  ]

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gradient-purple-ocean text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute w-full h-full opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <motion.h2
          className="text-h2 font-bold text-white text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Тарифы
        </motion.h2>
        

        <div className="grid grid-cols-1 gap-8 max-w-md mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className="relative rounded-3xl p-8 bg-white/10 backdrop-blur-md border-2 border-white/20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >

              {/* Plan name */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-white/70 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-body text-white/70">/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-body text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button
                  variant="primary"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}






