'use client'

import { FC } from 'react'
import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface BotPricingProps {}

export const BotPricing: FC<BotPricingProps> = () => {
  const plans = [
    {
      name: 'Free',
      price: '0₽',
      period: 'навсегда',
      description: 'Идеально для начала',
      features: [
        '10 вопросов в день',
        'Базовые ответы',
        'Доступ к бесплатным видео',
        'Чек-листы',
      ],
      cta: 'Начать бесплатно',
      ctaLink: 'https://t.me/bezpauzy_bot',
      popular: false,
      gradient: 'from-lavender-bg to-soft-white',
    },
    {
      name: 'Paid1',
      price: '800₽',
      period: 'в месяц',
      description: 'Для активных пользователей',
      features: [
        '∞ вопросов в день',
        'Расширенные ответы',
        'Доступ к врачам',
        'Базовые видео',
        'Приоритетная поддержка',
      ],
      cta: 'Оформить подписку',
      ctaLink: 'https://t.me/bezpauzy_bot?start=paid1',
      popular: true,
      gradient: 'from-primary-purple to-ocean-wave-start',
    },
    {
      name: 'Paid2',
      price: '2,000₽',
      period: 'в месяц',
      description: 'Максимальная поддержка',
      features: [
        'Всё из Paid1',
        'Premium видео-курсы',
        'Приоритетная поддержка',
        'Эксклюзивные материалы',
        'Ранний доступ к новым функциям',
      ],
      cta: 'Оформить подписку',
      ctaLink: 'https://t.me/bezpauzy_bot?start=paid2',
      popular: false,
      gradient: 'from-ocean-wave-start to-warm-accent',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-purple-ocean text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
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
          className="text-body-large text-white/90 text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Выберите план, который подходит именно вам
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-3xl p-8 bg-white/10 backdrop-blur-md border-2 ${
                plan.popular
                  ? 'border-white/50 shadow-strong scale-105'
                  : 'border-white/20'
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-warm-accent text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Популярный
                  </div>
                </div>
              )}

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
                  variant={plan.popular ? 'primary' : 'ghost'}
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


