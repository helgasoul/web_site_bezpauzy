'use client'

import { FC } from 'react'
import Link from 'next/link'
import { Check, Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface BotPricingProps {}

export const BotPricing: FC<BotPricingProps> = () => {
  const plans = [
    {
      name: 'Месячная подписка',
      price: '990₽',
      period: 'месяц',
      description: 'Попробуйте на месяц',
      features: [
        'Неограниченные вопросы Еве',
        'Персонализированные ответы',
        'База знаний и статьи',
        'Рекомендации врачей',
        'Видео уроки от врачей',
        'Синхронизация с Telegram',
        'История диалогов',
      ],
      cta: 'Оформить подписку',
      ctaLink: '/payment/subscribe',
      popular: false,
    },
    {
      name: 'Годовая подписка',
      price: '7990₽',
      period: 'год',
      description: 'Выгодно! 2 месяца в подарок',
      savings: 'Экономия 4000₽',
      features: [
        'Все возможности месячной подписки',
        'Экономия 33% (2 месяца бесплатно)',
        'Приоритетная поддержка',
        'Ранний доступ к новым функциям',
        'Персональные рекомендации',
        'Видео уроки от врачей',
        'Скидки на консультации экспертов',
      ],
      cta: 'Оформить подписку',
      ctaLink: '/payment/subscribe',
      popular: true,
    },
  ]

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gradient-purple-ocean text-white relative overflow-hidden">
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
        
        <motion.p
          className="text-body text-white/80 text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Выберите подходящий план и получите полный доступ к Еве, видео урокам от врачей и экспертным рекомендациям
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-3xl p-8 backdrop-blur-md border-2 ${
                plan.popular 
                  ? 'bg-white/20 border-white/40 md:scale-105' 
                  : 'bg-white/10 border-white/20'
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Популярный выбор
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-white/70 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-body text-white/70">/ {plan.period}</span>
                </div>
                {plan.savings && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-success/20 backdrop-blur-sm rounded-full">
                    <span className="text-sm font-semibold text-white">{plan.savings}</span>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                    <span className="text-body text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaLink}
                className="block w-full"
              >
                <Button
                  variant="primary"
                  className="w-full bg-white text-primary-purple hover:bg-white/90"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-white/70 mt-8 text-sm">
          Безопасная оплата через ЮКасса. Отменить подписку можно в любой момент.
        </p>
      </div>
    </section>
  )
}
