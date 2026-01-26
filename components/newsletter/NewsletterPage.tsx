'use client'

import { FC, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Sparkles, Check, Shield, Bell, BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BackButton } from '@/components/ui/BackButton'
import Link from 'next/link'

interface NewsletterPageProps {}

export const NewsletterPage: FC<NewsletterPageProps> = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
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
          name: name || undefined,
          source: 'newsletter_page',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setEmail('')
        setName('')
      } else {
        setError(data.error || 'Произошла ошибка при подписке')
      }
    } catch (err) {
      setError('Произошла ошибка сети. Попробуйте ещё раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-soft-white to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-20">
        <BackButton variant="ghost" />
      </div>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary-purple to-ocean-wave-start overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/90 to-ocean-wave-start/90" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-body-small font-semibold text-white">Подписка на рассылку</span>
            </div>

            <h1 className="text-h1 md:text-display font-bold text-white mb-6 drop-shadow-lg">
              Научные новости о менопаузе
            </h1>

            <p className="text-body-large text-white/95 mb-8 drop-shadow-md max-w-2xl mx-auto">
              Получайте еженедельную рассылку с актуальными статьями, исследованиями и практическими советами от врачей-экспертов проекта
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24 bg-soft-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-strong border border-lavender-bg text-center"
              >
                <div className="w-16 h-16 bg-ocean-wave-start/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-ocean-wave-start" />
                </div>
                <h2 className="text-h2 font-bold text-deep-navy mb-4">
                  Спасибо за подписку!
                </h2>
                <p className="text-body-large text-deep-navy/70 mb-6">
                  Мы отправили письмо с подтверждением на ваш email. 
                  Пожалуйста, проверьте почту и подтвердите подписку.
                </p>
                <Link href="/">
                  <Button variant="primary" className="w-full sm:w-auto">
                    Вернуться на главную
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-strong border border-lavender-bg"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-body-small font-semibold text-deep-navy mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-navy/40" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-body text-deep-navy placeholder:text-deep-navy/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-body-small font-semibold text-deep-navy mb-2">
                      Имя (необязательно)
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Как к вам обращаться?"
                      className="w-full px-4 py-4 rounded-full border-2 border-lavender-bg focus:border-primary-purple focus:outline-none text-body text-deep-navy placeholder:text-deep-navy/40 transition-colors"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-2xl p-4"
                    >
                      <p className="text-body-small text-red-600">{error}</p>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>Отправка...</>
                    ) : (
                      <>
                        Подписаться на рассылку
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-deep-navy/50 text-center">
                    Нажимая кнопку &quot;Подписаться&quot;, вы соглашаетесь с{' '}
                    <Link href="/privacy" className="underline hover:text-primary-purple">
                      политикой конфиденциальности
                    </Link>
                    . Отписаться можно в любой момент.
                  </p>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-h2 font-bold text-deep-navy text-center mb-12">
              Что вы получите?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-primary-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-primary-purple" />
                </div>
                <h3 className="text-h4 font-semibold text-deep-navy mb-2">
                  Еженедельные новости
                </h3>
                <p className="text-body text-deep-navy/70">
                  Раз в неделю — актуальные научные исследования и практические советы
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-ocean-wave-start/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-ocean-wave-start" />
                </div>
                <h3 className="text-h4 font-semibold text-deep-navy mb-2">
                  Проверенная информация
                </h3>
                <p className="text-body text-deep-navy/70">
                  Все материалы проверены врачами-экспертами проекта и основаны на научных данных
                </p>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-16 h-16 bg-warm-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-warm-accent" />
                </div>
                <h3 className="text-h4 font-semibold text-deep-navy mb-2">
                  Конфиденциально
                </h3>
                <p className="text-body text-deep-navy/70">
                  Мы не передаём ваши данные третьим лицам. Отписаться можно в любой момент
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

