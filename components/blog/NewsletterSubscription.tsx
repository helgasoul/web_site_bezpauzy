'use client'

import { FC, useState } from 'react'
import { Mail, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface NewsletterSubscriptionProps {}

export const NewsletterSubscription: FC<NewsletterSubscriptionProps> = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Integrate with API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSubmitted(true)
    setEmail('')
  }

  return (
    <section className="py-16 md:py-24 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-br from-lavender-bg to-soft-white rounded-3xl p-8 md:p-12 text-center border border-lavender-bg shadow-card">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-purple/10 rounded-full mb-6">
              <Mail className="w-4 h-4 text-primary-purple" />
              <span className="text-sm font-medium text-primary-purple">Подписка на рассылку</span>
            </div>

            <h3 className="text-h3 font-bold text-deep-navy mb-4">
              Подпишитесь на рассылку
            </h3>

            <p className="text-body text-deep-navy/70 mb-8 max-w-lg mx-auto">
              Раз в неделю — научные новости о менопаузе и практические советы от врачей.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ваш email"
                  required
                  className="flex-1 px-6 py-4 rounded-full border-2 border-lavender-bg focus:border-primary-purple focus:outline-none bg-white text-deep-navy"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="whitespace-nowrap"
                >
                  {isSubmitting ? 'Отправка...' : 'Подписаться →'}
                </Button>
              </form>
            ) : (
              <motion.div
                className="flex items-center justify-center gap-3 text-primary-purple"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Спасибо! Проверьте почту для подтверждения.</span>
              </motion.div>
            )}

            <p className="text-caption text-deep-navy/60 mt-6">
              Политика конфиденциальности. Отписка в любой момент.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


