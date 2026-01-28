'use client'

import { FC, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Sparkles, Lock, Loader2, Crown, Zap } from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
  popular?: boolean
  savings?: string
}

const plans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Месячная подписка',
    price: 990,
    period: 'мес',
    description: 'Попробуйте на месяц',
    features: [
      'Неограниченные вопросы Еве',
      'Персонализированные ответы',
      'База знаний и статьи',
      'Рекомендации врачей',
      'Синхронизация с Telegram',
      'История диалогов',
    ],
  },
  {
    id: 'annual',
    name: 'Годовая подписка',
    price: 7990,
    period: 'год',
    description: 'Выгодно! 2 месяца в подарок',
    savings: 'Экономия 4000₽',
    popular: true,
    features: [
      'Все возможности месячной подписки',
      'Экономия 33% (2 месяца бесплатно)',
      'Приоритетная поддержка',
      'Ранний доступ к новым функциям',
      'Персональные рекомендации',
      'Скидки на консультации экспертов',
    ],
  },
]

export default function SubscribePage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>('annual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/telegram/get-session')
      const data = await response.json()
      setIsAuthenticated(data.authenticated || false)
      
      if (data.user?.subscriptionStatus === 'active') {
        router.push('/chat')
      }
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push('/chat')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const plan = plans.find((p) => p.id === selectedPlan)
      if (!plan) {
        throw new Error('План не выбран')
      }

      const response = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          amount: plan.price,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании платежа')
      }

      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl
      } else {
        throw new Error('Не получена ссылка для оплаты')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при оформлении подписки')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary-purple animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-bg via-white to-lavender-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-purple/10 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-primary-purple" />
            <span className="text-sm font-medium text-primary-purple">Подписка на Еву</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-deep-navy mb-4">
            Получите неограниченный доступ к Еве
          </h1>
          <p className="text-xl text-deep-navy/70 max-w-2xl mx-auto">
            Персональный AI-консультант, который всегда рядом и знает ответы на ваши вопросы о менопаузе
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={"relative bg-white rounded-3xl p-8 cursor-pointer transition-all duration-300 " + (
                selectedPlan === plan.id
                  ? 'ring-4 ring-primary-purple shadow-2xl scale-105'
                  : 'ring-2 ring-lavender-bg hover:ring-primary-purple/50 hover:shadow-xl'
              ) + (plan.popular ? ' md:scale-105' : '')}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Популярный выбор
                </div>
              )}

              <div
                className={"absolute top-8 right-8 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 " + (
                  selectedPlan === plan.id
                    ? 'border-primary-purple bg-primary-purple'
                    : 'border-deep-navy/30 bg-white'
                )}
              >
                {selectedPlan === plan.id && <Check className="w-4 h-4 text-white" />}
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-deep-navy mb-2">{plan.name}</h3>
                <p className="text-sm text-deep-navy/60 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-deep-navy">{plan.price}₽</span>
                  <span className="text-lg text-deep-navy/60">/ {plan.period}</span>
                </div>
                {plan.savings && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-success/10 rounded-full">
                    <Zap className="w-4 h-4 text-success" />
                    <span className="text-sm font-semibold text-success">{plan.savings}</span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary-purple flex-shrink-0 mt-0.5" />
                    <span className="text-deep-navy/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-6 p-4 bg-error/10 border border-error/20 rounded-xl"
          >
            <p className="text-sm text-error text-center">{error}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-purple to-ocean-wave-start text-white px-8 py-5 rounded-full text-lg font-semibold hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Создание платежа...</span>
              </>
            ) : (
              <>
                <Lock className="w-6 h-6" />
                <span>Оформить подписку</span>
              </>
            )}
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-deep-navy/60">
            <Lock className="w-4 h-4" />
            <span>Безопасная оплата через ЮКасса</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-deep-navy mb-6 text-center">
            Почему выбирают подписку на Еву?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-purple" />
              </div>
              <h4 className="font-semibold text-deep-navy mb-2">Персонализация</h4>
              <p className="text-sm text-deep-navy/60">
                Ева учитывает ваш возраст, город и историю диалогов для максимально точных ответов
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary-purple" />
              </div>
              <h4 className="font-semibold text-deep-navy mb-2">Научный подход</h4>
              <p className="text-sm text-deep-navy/60">
                Все ответы основаны на современных медицинских исследованиях и проверенных источниках
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary-purple" />
              </div>
              <h4 className="font-semibold text-deep-navy mb-2">Конфиденциально</h4>
              <p className="text-sm text-deep-navy/60">
                Ваши данные защищены и никогда не передаются третьим лицам
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-deep-navy mb-6 text-center">
            Часто задаваемые вопросы
          </h3>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6">
              <h4 className="font-semibold text-deep-navy mb-2">Можно ли отменить подписку?</h4>
              <p className="text-sm text-deep-navy/60">
                Да, вы можете отменить подписку в любой момент через личный кабинет. Доступ сохранится до конца оплаченного периода.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6">
              <h4 className="font-semibold text-deep-navy mb-2">Как работает синхронизация с Telegram?</h4>
              <p className="text-sm text-deep-navy/60">
                После оплаты подписки вы сможете общаться с Евой как на сайте, так и в Telegram боте. Все диалоги автоматически синхронизируются.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6">
              <h4 className="font-semibold text-deep-navy mb-2">Безопасна ли оплата?</h4>
              <p className="text-sm text-deep-navy/60">
                Да, мы используем ЮКасса — надежный платежный сервис. Ваши данные карты защищены по стандарту PCI DSS.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
