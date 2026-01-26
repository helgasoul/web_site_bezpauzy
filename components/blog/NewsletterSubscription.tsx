'use client'

import { FC, useState } from 'react'
import { Mail, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface NewsletterSubscriptionProps {}

export const NewsletterSubscription: FC<NewsletterSubscriptionProps> = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          source: 'blog_page',
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setEmail('')
      } else {
        const data = await response.json()
        setError(data.error || 'Произошла ошибка при подписке')
      }
    } catch (err) {
      setError('Произошла ошибка сети. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary-purple/10 via-ocean-wave-start/5 to-warm-accent/10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-strong border border-lavender-bg">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-purple/10 backdrop-blur-md rounded-full border border-primary-purple/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary-purple" />
              <span className="text-sm font-medium text-primary-purple">Подписка на рассылку</span>
            </div>

            <h2 className="text-h3 md:text-h2 font-bold text-deep-navy mb-4">
              Получайте научные новости о менопаузе
            </h2>

            <p className="text-body-large text-deep-navy/70 mb-8 max-w-2xl mx-auto">
              Подпишитесь на нашу рассылку и получайте актуальные статьи, исследования и рекомендации от врачей прямо на почту
            </p>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-ocean-wave-start/10 border border-ocean-wave-start/30 rounded-2xl p-6"
              >
                <p className="text-body font-medium text-deep-navy">
                  ✅ Спасибо за подписку! Проверьте почту для подтверждения.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ваш email"
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-body text-deep-navy placeholder:text-deep-navy/40 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-primary-purple text-white rounded-full font-semibold hover:bg-primary-purple/90 hover:shadow-strong transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? 'Отправка...' : 'Подписаться'}
                </button>
              </form>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-red-600"
              >
                {error}
              </motion.p>
            )}

            <p className="text-xs text-deep-navy/50 mt-6">
              Мы не передаём ваши данные третьим лицам. Отписаться можно в любой момент.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
